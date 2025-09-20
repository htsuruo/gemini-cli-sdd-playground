const request = require('supertest');
const app = require('./app');

describe('App', () => {
  it('should return 200 OK for GET /', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
});