import { Sequelize, Dialect } from 'sequelize';
import configJson from '../config/config.json';

interface DbConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: Dialect;
  use_env_variable?: string;
}

interface Config {
  development: DbConfig;
  test: DbConfig;
  production: DbConfig;
}

const env = process.env.NODE_ENV || 'development';
const config: DbConfig = (configJson as Config)[env as keyof Config];

let sequelize: Sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable] as string, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

export default sequelize;
