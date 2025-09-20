import { DataTypes } from 'sequelize'
import sequelize from '../src/db.js'
import recoveryCodeInitializer from './recoverycode.js'
import twoFactorAuthInitializer from './twofactorauth.js'
import userInitializer from './user.js'

const User = userInitializer(sequelize)
const RecoveryCode = recoveryCodeInitializer(sequelize)
const TwoFactorAuth = twoFactorAuthInitializer(sequelize)

User.associate({ TwoFactorAuth, RecoveryCode })
RecoveryCode.associate({ User })
TwoFactorAuth.associate({ User })

export { RecoveryCode, sequelize, TwoFactorAuth, User }
