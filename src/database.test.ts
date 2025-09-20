import * as db from '../models';
const { sequelize } = db;

describe('Database', () => {
  afterAll(async () => {
    await sequelize.close();
  });

  it('should connect to the database', async () => {
    await sequelize.authenticate();
  });

  it('should have User model', () => {
    expect(db.User).toBeDefined();
  });

  it('should have TwoFactorAuth model', () => {
    expect(db.TwoFactorAuth).toBeDefined();
  });

  it('should have RecoveryCode model', () => {
    expect(db.RecoveryCode).toBeDefined();
  });
});
