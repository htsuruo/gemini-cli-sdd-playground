import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface UserAttributes {
  id: string;
  google_id: string | null;
  github_id: string | null;
  email: string;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'google_id' | 'github_id'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public google_id!: string | null;
  public github_id!: string | null;
  public email!: string;

  public static associate(models: any) {
    User.hasOne(models.TwoFactorAuth, { foreignKey: 'user_id' });
    User.hasMany(models.RecoveryCode, { foreignKey: 'user_id' });
  }
}

export default (sequelize: Sequelize) => {
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    google_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    github_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
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