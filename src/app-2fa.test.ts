import { jest } from '@jest/globals';
import request from 'supertest';
import app from './app';
import { User, TwoFactorAuth, RecoveryCode, sequelize } from '../models';
import speakeasy from 'speakeasy';

// Mock the passport-google-oauth20 strategy
jest.mock('passport-google-oauth20', () => {
  const Strategy = require('passport-strategy');
  class MockStrategy extends Strategy {
    constructor(options: any, verify: any) {
      super();
      this.name = 'google';
      this.verify = verify;
    }

    authenticate(req: any, options: any) {
      const profile = {
        id: '12345',
        displayName: 'Test User',
        emails: [{ value: 'test@example.com' }],
      };
      this.verify(null, null, profile, (err: any, user: any) => {
        if (err) {
          return this.error(err);
        }
        this.success(user);
      });
    }
  }
  return { Strategy: MockStrategy };
});

describe('2FA Endpoints', () => {
  let agent: any;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    agent = request.agent(app);
    // Log in the user
    await agent.get('/auth/google/callback');
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /2fa/setup', () => {
    it('should return a QR code and secret in test env', async () => {
      const response = await agent.post('/2fa/setup').send();
      expect(response.statusCode).toBe(200);
      expect(response.body.qr_code_url).toBeDefined();
      expect(response.body.secret).toBeDefined();
    });

    it('should fail if not authenticated', async () => {
      const response = await request(app).post('/2fa/setup').send();
      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /2fa/verify', () => {
    let secret: string;

    beforeEach(async () => {
      const response = await agent.post('/2fa/setup').send();
      secret = response.body.secret;
    });

    it('should enable 2FA with a valid token', async () => {
      const token = speakeasy.totp({
        secret: secret,
        encoding: 'base32'
      });

      const response = await agent.post('/2fa/verify').send({ token });
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.recovery_codes).toHaveLength(10);

      const user = await User.findOne({ where: { email: 'test@example.com' } });
      const twoFactorAuth = await TwoFactorAuth.findOne({ where: { user_id: user!.id } });
      expect(twoFactorAuth).not.toBeNull();
      expect(twoFactorAuth!.is_enabled).toBe(true);
    });

    it('should fail with an invalid token', async () => {
      const response = await agent.post('/2fa/verify').send({ token: '000000' });
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('2FA Login Flow', () => {
    let secret: string;
    let recoveryCodes: string[];

    beforeEach(async () => {
      const setupResponse = await agent.post('/2fa/setup').send();
      secret = setupResponse.body.secret;
      const token = speakeasy.totp({ secret, encoding: 'base32' });
      const verifyResponse = await agent.post('/2fa/verify').send({ token });
      recoveryCodes = verifyResponse.body.recovery_codes;

      // Re-login to trigger 2FA
      await agent.get('/auth/google/callback');
    });

    it('should redirect to /login/2fa if 2FA is enabled', async () => {
      const response = await agent.get('/auth/google/callback');
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/login/2fa');
    });

    it('should login with a valid OTP', async () => {
      const token = speakeasy.totp({ secret, encoding: 'base32' });
      const response = await agent.post('/login/2fa').send({ token });
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail with an invalid OTP', async () => {
      const response = await agent.post('/login/2fa').send({ token: '000000' });
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should login with a valid recovery code', async () => {
      const response = await agent.post('/login/recovery').send({ recovery_code: recoveryCodes[0] });
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('2FA has been disabled');
    });

    it('should fail with an invalid recovery code', async () => {
      const response = await agent.post('/login/recovery').send({ recovery_code: 'invalid-code' });
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with a used recovery code', async () => {
      await agent.post('/login/recovery').send({ recovery_code: recoveryCodes[0] });
      // Re-login to trigger 2FA again
      await agent.get('/auth/google/callback');
      const response = await agent.post('/login/recovery').send({ recovery_code: recoveryCodes[0] });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('already been used');
    });
  });
});