import { DataTypes, Model, Optional, Sequelize } from 'sequelize'

export interface RecoveryCodeAttributes {
  id: number
  user_id: string
  code_hash: string
  is_used: boolean
}
type RecoveryCodeCreationAttributes = Optional<RecoveryCodeAttributes, 'id'>

class RecoveryCode
  extends Model<RecoveryCodeAttributes, RecoveryCodeCreationAttributes>
  implements RecoveryCodeAttributes
{
  public id!: number
  public user_id!: string
  public code_hash!: string
  public is_used!: boolean

  public static associate(models: any) {
    RecoveryCode.belongsTo(models.User, { foreignKey: 'user_id' })
  }
}

export default (sequelize: Sequelize) => {
  RecoveryCode.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: DataTypes.UUID,
      code_hash: DataTypes.STRING,
      is_used: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'RecoveryCode',
    }
  )
  return RecoveryCode
}
