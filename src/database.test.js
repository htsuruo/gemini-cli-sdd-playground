const { sequelize } = require('../models');

describe('Database', () => {
  it('should connect to the database', async () => {
    await sequelize.authenticate();
  });

  it('should have User model', () => {
    expect(sequelize.models.User).toBeDefined();
  });

  it('should have TwoFactorAuth model', () => {
    expect(sequelize.models.TwoFactorAuth).toBeDefined();
  });

  it('should have RecoveryCode model', () => {
    expect(sequelize.models.RecoveryCode).toBeDefined();
  });
});