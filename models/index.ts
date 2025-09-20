import { DataTypes } from 'sequelize'
import sequelize from '../src/db'
import recoveryCodeInitializer from './recoverycode'
import twoFactorAuthInitializer from './twofactorauth'
import userInitializer from './user'

const User = userInitializer(sequelize)
const RecoveryCode = recoveryCodeInitializer(sequelize)
const TwoFactorAuth = twoFactorAuthInitializer(sequelize)

User.associate({ TwoFactorAuth, RecoveryCode })
RecoveryCode.associate({ User })
TwoFactorAuth.associate({ User })

export { RecoveryCode, sequelize, TwoFactorAuth, User }
