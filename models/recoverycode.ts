import { Model, DataTypes, Sequelize } from 'sequelize';

interface RecoveryCodeAttributes {
  user_id: string;
  code_hash: string;
  is_used: boolean;
}

class RecoveryCode extends Model<RecoveryCodeAttributes> implements RecoveryCodeAttributes {
  public user_id!: string;
  public code_hash!: string;
  public is_used!: boolean;

  public static associate(models: any) {
    RecoveryCode.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

export default (sequelize: Sequelize) => {
  RecoveryCode.init({
    user_id: DataTypes.UUID,
    code_hash: DataTypes.STRING,
    is_used: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'RecoveryCode',
  });
  return RecoveryCode;
};