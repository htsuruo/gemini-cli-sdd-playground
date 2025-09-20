'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RecoveryCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RecoveryCode.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
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