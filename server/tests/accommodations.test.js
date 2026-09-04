/**
 * accommodations.test.js
 * Tests for GET /api/accommodations and GET /api/accommodations/:id
 * Also tests protected POST (create) route.
 */
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Accommodation = require('../models/Accommodation');

require('./setup');

const TEST_EMAIL = `host_${Date.now()}@test.com`;
const TEST_PASSWORD = 'Host1234!';
const TEST_USERNAME = `host_${Date.now()}`;

let token;
let createdId;

// Register a test host and log in before all tests
beforeAll(async () => {
  const reg = await request(app)
    .post('/api/users/register')
    .send({ username: TEST_USERNAME, email: TEST_EMAIL, password: TEST_PASSWORD, role: 'host' });
  token = reg.body.token;
});

// Clean up test data after all tests
afterAll(async () => {
  if (createdId) await Accommodation.findByIdAndDelete(createdId);
  await User.deleteOne({ email: TEST_EMAIL });
});

describe('GET /api/accommodations', () => {
  it('should return paginated accommodations', async () => {
    const res = await request(app).get('/api/accommodations');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('page', 1);
  });

  it('should filter by location query param', async () => {
    const res = await request(app).get('/api/accommodations?location=Johannesburg');

    expect(res.statusCode).toBe(200);
    res.body.data.forEach((acc) => {
      expect(acc.location.toLowerCase()).toContain('johannesburg');
    });
  });

  it('should respect page and limit query params', async () => {
    const res = await request(app).get('/api/accommodations?page=1&limit=3');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
    expect(res.body.pagination.limit).toBe(3);
  });
});

describe('POST /api/accommodations', () => {
  it('should return 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/accommodations')
      .send({ title: 'Test', location: 'Test' });

    expect(res.statusCode).toBe(401);
  });

  it('should create a listing when authenticated', async () => {
    const res = await request(app)
      .post('/api/accommodations')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Test Listing')
      .field('location', 'Test City')
      .field('description', 'A test description for the listing.')
      .field('type', 'Entire apartment')
      .field('price', '100')
      .field('bedrooms', '2')
      .field('bathrooms', '1')
      .field('guests', '4');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('title', 'Test Listing');
    createdId = res.body._id;
  });
});

describe('GET /api/accommodations/:id', () => {
  it('should return a single accommodation by id', async () => {
    if (!createdId) return; // skip if create test failed

    const res = await request(app).get(`/api/accommodations/${createdId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', createdId);
    expect(res.body).toHaveProperty('title', 'Test Listing');
  });

  it('should return 404 for a valid but non-existent id', async () => {
    const res = await request(app).get('/api/accommodations/000000000000000000000000');
    expect(res.statusCode).toBe(404);
  });

  it('should return 500 for an invalid id format', async () => {
    const res = await request(app).get('/api/accommodations/not-a-valid-id');
    expect(res.statusCode).toBe(500);
  });
});

describe('DELETE /api/accommodations/:id', () => {
  it('should return 401 when not authenticated', async () => {
    if (!createdId) return;
    const res = await request(app).delete(`/api/accommodations/${createdId}`);
    expect(res.statusCode).toBe(401);
  });

  it('should delete the listing when authenticated as the owner', async () => {
    if (!createdId) return;

    const res = await request(app)
      .delete(`/api/accommodations/${createdId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    createdId = null; // already deleted, skip afterAll cleanup
  });
});
