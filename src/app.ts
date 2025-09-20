import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { User } from '../models';


const app = express();

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback) => {
    try {
      if (!profile.emails || profile.emails.length === 0) {
        return cb(new Error("No email found in profile"));
      }

      let user = await User.findOne({ where: { google_id: profile.id } });

      if (!user) {
        user = await User.create({
          google_id: profile.id,
          email: profile.emails[0].value,
        });
      }

      return cb(null, user);
    } catch (err) {
      return cb(err as any);
    }
  }
));

passport.serializeUser((user: any, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id: number, cb) => {
  try {
    const user = await User.findByPk(id);
    cb(null, user);
  } catch (err) {
    cb(err);
  }
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Google auth route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google auth callback route
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req: Request, res: Response) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

// Protected profile route
app.get('/profile', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else {
    res.status(401).send('Unauthorized');
  }
});

export default app;