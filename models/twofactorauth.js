'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TwoFactorAuth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TwoFactorAuth.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
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