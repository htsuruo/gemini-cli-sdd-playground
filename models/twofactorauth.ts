import { Model, DataTypes, Sequelize } from 'sequelize';

interface TwoFactorAuthAttributes {
  user_id: string;
  secret: string;
  is_enabled: boolean;
}

class TwoFactorAuth extends Model<TwoFactorAuthAttributes> implements TwoFactorAuthAttributes {
  public user_id!: string;
  public secret!: string;
  public is_enabled!: boolean;

  public static associate(models: any) {
    TwoFactorAuth.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

export default (sequelize: Sequelize) => {
  TwoFactorAuth.init({
    user_id: DataTypes.UUID,
    secret: DataTypes.STRING,
    is_enabled: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'TwoFactorAuth',
  });
  return TwoFactorAuth;
};