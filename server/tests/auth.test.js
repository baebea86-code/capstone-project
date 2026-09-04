/**
 * auth.test.js
 * Tests for POST /api/users/register, POST /api/users/login, GET /api/users/me
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

const TEST_EMAIL = `testuser_${Date.now()}@test.com`;
const TEST_PASSWORD = 'Test1234!';
const TEST_USERNAME = `testuser_${Date.now()}`;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
}, 30000);

afterAll(async () => {
  await User.deleteOne({ email: TEST_EMAIL });
  await mongoose.connection.close();
}, 15000);

describe('POST /api/users/register', () => {
  it('should register a new user and return a token', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: TEST_USERNAME, email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('email', TEST_EMAIL);
    expect(res.body).not.toHaveProperty('password');
  });

  it('should return 400 when registering with a duplicate email', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: TEST_USERNAME, email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ email: 'nousername@test.com' });

    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/users/login', () => {
  it('should login successfully and return a token', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('email', TEST_EMAIL);
  });

  it('should return 401 with wrong password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: TEST_EMAIL, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 401 with non-existent email', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'nobody@nowhere.com', password: TEST_PASSWORD });

    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/users/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    token = res.body.token;
  });

  it('should return the logged-in user profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', TEST_EMAIL);
    expect(res.body).not.toHaveProperty('password');
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.statusCode).toBe(401);
  });
});
