const request = require('supertest');
const app = require('./app');

describe('App', () => {
  it('should return 200 OK for GET /', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

  it('should redirect to Google for GET /auth/google', async () => {
    const response = await request(app).get('/auth/google');
    expect(response.statusCode).toBe(302);
  });
});