import bcrypt from 'bcrypt'
import crypto from 'crypto'
import 'dotenv/config'
import express, { Request, Response } from 'express'
import session from 'express-session'
import passport from 'passport'
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20'
import qrcode from 'qrcode'
import speakeasy from 'speakeasy'
import {
  RecoveryCode,
  RecoveryCodeAttributes,
  TwoFactorAuth,
  User,
  UserAttributes,
} from '../models/index.js'

declare module 'express-session' {
  interface SessionData {
    temp_2fa_secret?: string
    is_2fa_pending?: boolean
  }
}

const app = express()
app.use(express.json())

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
  })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: '/auth/google/callback',
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      cb: VerifyCallback
    ) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return cb(new Error('No email found in profile'))
        }

        let user = await User.findOne({ where: { google_id: profile.id } })

        if (!user) {
          user = await User.create({
            google_id: profile.id,
            email: profile.emails[0].value,
          })
        }

        return cb(null, user)
      } catch (err) {
        return cb(err as any)
      }
    }
  )
)

passport.serializeUser((user: any, cb) => {
  cb(null, user.id)
})

passport.deserializeUser(async (id: number, cb) => {
  try {
    const user = await User.findByPk(id)
    cb(null, user)
  } catch (err) {
    cb(err)
  }
})

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('OK')
})

// Google auth route
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

// Google auth callback route
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req: Request, res: Response) => {
    const user = req.user as UserAttributes
    try {
      const twoFactorAuth = await TwoFactorAuth.findOne({
        where: { user_id: user.id },
      })

      if (twoFactorAuth && twoFactorAuth.is_enabled) {
        req.session.is_2fa_pending = true
        res.redirect('/login/2fa') // Redirect to a new 2FA page
      } else {
        res.redirect('/')
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error)
      res.redirect('/')
    }
  }
)

app.get('/login/2fa', (req: Request, res: Response) => {
  if (req.session.is_2fa_pending) {
    res.status(200).send('Please provide your 2FA token.')
  } else {
    res.redirect('/')
  }
})

app.post('/login/2fa', async (req: Request, res: Response) => {
  if (!req.session.is_2fa_pending) {
    return res.status(401).send('Unauthorized')
  }

  const user = req.user as UserAttributes
  const { token } = req.body

  if (!token) {
    return res.status(400).send('Token is required')
  }

  try {
    const twoFactorAuth = await TwoFactorAuth.findOne({
      where: { user_id: user.id },
    })

    if (!twoFactorAuth || !twoFactorAuth.is_enabled) {
      return res.status(400).send('2FA is not enabled for this account.')
    }

    const verified = speakeasy.totp.verify({
      secret: twoFactorAuth.secret,
      encoding: 'base32',
      token: token,
    })

    if (verified) {
      req.session.is_2fa_pending = undefined
      res.status(200).json({ success: true, message: 'Login successful' })
    } else {
      // Here you could implement a failed attempts counter and account lockout
      res.status(400).json({ success: false, message: 'Invalid token' })
    }
  } catch (error) {
    console.error('Error verifying 2FA token:', error)
    res.status(500).send('Error verifying 2FA token')
  }
})

app.post('/login/recovery', async (req: Request, res: Response) => {
  if (!req.session.is_2fa_pending) {
    return res.status(401).send('Unauthorized')
  }

  const user = req.user as UserAttributes
  const { recovery_code } = req.body

  if (!recovery_code) {
    return res.status(400).send('Recovery code is required')
  }

  try {
    const recoveryCodes = await RecoveryCode.findAll({
      where: { user_id: user.id },
    })

    let match = false
    let usedCode: RecoveryCodeAttributes | null = null

    for (const code of recoveryCodes) {
      const isMatch = await bcrypt.compare(recovery_code, code.code_hash)
      if (isMatch) {
        match = true
        usedCode = code
        break
      }
    }

    if (match && usedCode) {
      if (usedCode.is_used) {
        return res
          .status(400)
          .json({
            success: false,
            message: 'Recovery code has already been used',
          })
      }

      await RecoveryCode.update(
        { is_used: true },
        { where: { id: usedCode.id } }
      )

      // Disable 2FA
      const twoFactorAuth = await TwoFactorAuth.findOne({
        where: { user_id: user.id },
      })
      if (twoFactorAuth) {
        twoFactorAuth.is_enabled = false
        await twoFactorAuth.save()
      }

      req.session.is_2fa_pending = undefined
      res.status(200).json({
        success: true,
        message:
          'Login successful. 2FA has been disabled. Please re-enable it.',
      })
    } else {
      res.status(400).json({ success: false, message: 'Invalid recovery code' })
    }
  } catch (error) {
    console.error('Error verifying recovery code:', error)
    res.status(500).send('Error verifying recovery code')
  }
})

// Protected profile route
app.get('/profile', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user)
  } else {
    res.status(401).send('Unauthorized')
  }
})

// 2FA setup route
app.post('/2fa/setup', (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized')
  }

  const user = req.user as UserAttributes

  const secret = speakeasy.generateSecret({
    name: `Gemini SDD (${user.email})`,
  })

  req.session.temp_2fa_secret = secret.base32

  qrcode.toDataURL(secret.otpauth_url!, (err, data_url) => {
    if (err) {
      console.error('Error generating QR code:', err)
      return res.status(500).send('Error generating QR code')
    }
    res.json({
      qr_code_url: data_url,
      ...(process.env.NODE_ENV === 'test' && { secret: secret.base32 }),
    })
  })
})

// 2FA verify route
app.post('/2fa/verify', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized')
  }

  const user = req.user as UserAttributes
  const { token } = req.body

  if (!token) {
    return res.status(400).send('Token is required')
  }

  const secret = req.session.temp_2fa_secret

  if (!secret) {
    return res.status(400).send('2FA setup not initiated')
  }

  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
  })

  if (verified) {
    try {
      const [twoFactorAuth, created] = await TwoFactorAuth.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          secret: secret,
          is_enabled: true,
        },
      })

      if (!created) {
        twoFactorAuth.secret = secret
        twoFactorAuth.is_enabled = true
        await twoFactorAuth.save()
      }

      req.session.temp_2fa_secret = undefined

      // Generate and save recovery codes
      const recoveryCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(8).toString('hex')
      )
      const saltRounds = 10

      await RecoveryCode.destroy({ where: { user_id: user.id } })

      for (const code of recoveryCodes) {
        const hashedCode = await bcrypt.hash(code, saltRounds)
        await RecoveryCode.create({
          user_id: user.id,
          code_hash: hashedCode,
          is_used: false,
        })
      }

      res.status(200).json({
        success: true,
        message: '2FA enabled successfully',
        recovery_codes: recoveryCodes,
      })
    } catch (error) {
      console.error('Error enabling 2FA:', error)
      res.status(500).send('Error enabling 2FA')
    }
  } else {
    res.status(400).json({ success: false, message: 'Invalid token' })
  }
})

export default app