'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.TwoFactorAuth, { foreignKey: 'user_id' });
      User.hasMany(models.RecoveryCode, { foreignKey: 'user_id' });
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    google_id: DataTypes.STRING,
    github_id: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};