import request from 'supertest';
import app from './app';
import { User, sequelize } from '../models';

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
      if (req.query.error) {
        return this.fail({ message: 'Access denied' });
      }

      if (req.url.includes('callback')) {
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
      } else {
        this.redirect('https://accounts.google.com/o/oauth2/v2/auth');
      }
    }
  }
  return { Strategy: MockStrategy };
});

describe('App', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should return 200 OK for GET /', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

  it('should redirect to Google for GET /auth/google', async () => {
    const response = await request(app).get('/auth/google');
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toContain('accounts.google.com');
  });

  it('should handle the Google auth callback and create a new user', async () => {
    const agent = request.agent(app);
    const response = await agent.get('/auth/google/callback');

    // Check that the user was created in the database
    const user = await User.findOne({ where: { google_id: '12345' } });
    expect(user).not.toBeNull();
    expect(user!.email).toBe('test@example.com');

    // Check for the redirect
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/');

    // Check if the user is authenticated by accessing a protected route
    const profileResponse = await agent.get('/profile');
    expect(profileResponse.statusCode).toBe(200);
    expect(profileResponse.body.email).toBe('test@example.com');
  });

  it('should handle a failure in the Google auth callback', async () => {
    const response = await request(app).get('/auth/google/callback?error=access_denied');
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/');
  });
});