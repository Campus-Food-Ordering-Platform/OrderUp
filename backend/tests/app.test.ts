import request from 'supertest';
import app from '../src/app';

// Mock the database pool so tests don't hit real Azure DB
jest.mock('../src/config/db', () => ({
  default: {
    query: jest.fn()
  }
}));

import pool from '../src/config/db';
const mockPool = pool as jest.Mocked<typeof pool>;

describe('Health Check', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Auth Endpoints', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/signup should return 400 if fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ auth0Id: 'test-123' }); // missing name and role
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  it('POST /api/auth/signup should return 400 if role is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ auth0Id: 'test-123', name: 'John', role: 'invalid_role' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid role');
  });

  it('POST /api/auth/signup should create a new user', async () => {
    // Mock: user doesn't exist yet
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] }) // findUserByAuth0Id returns nothing
      .mockResolvedValueOnce({ rows: [{ // createUser returns new user
        id: 'uuid-123',
        auth0_id: 'google-oauth2|test123',
        name: 'John Doe',
        role: 'customer',
        created_at: new Date()
      }]});

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ auth0Id: 'google-oauth2|test123', name: 'John Doe', role: 'customer' });

    expect(res.statusCode).toBe(201);
    expect(res.body.isNew).toBe(true);
    expect(res.body.user.name).toBe('John Doe');
  });

  it('POST /api/auth/signup should return 200 if user already exists', async () => {
    // Mock: user already exists
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{
        id: 'uuid-123',
        auth0_id: 'google-oauth2|test123',
        name: 'John Doe',
        role: 'customer',
        created_at: new Date()
      }]});

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ auth0Id: 'google-oauth2|test123', name: 'John Doe', role: 'customer' });

    expect(res.statusCode).toBe(200);
    expect(res.body.isNew).toBe(false);
  });

  it('GET /api/auth/me/:auth0Id should return 404 if user not found', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get(`/api/auth/me/${encodeURIComponent('google-oauth2|test123')}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('GET /api/auth/me/:auth0Id should return user if found', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{
        id: 'uuid-123',
        auth0_id: 'google-oauth2|test123',
        name: 'John Doe',
        role: 'customer',
        created_at: new Date()
      }]});

    const res = await request(app)
      .get(`/api/auth/me/${encodeURIComponent('google-oauth2|test123')}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('John Doe');
  });

});

describe('User Endpoints', () => {

  it('GET /api/users should return empty array', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/users should create a user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Jane Doe', email: 'jane@test.com', role: 'customer' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Jane Doe');
  });

  it('GET /api/users/:id should return 404 if user not found', async () => {
    const res = await request(app).get('/api/users/nonexistentid');
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/users/:id should return 404 if user not found', async () => {
    const res = await request(app)
      .put('/api/users/nonexistentid')
      .send({ name: 'Updated' });
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/users/:id should return 404 if user not found', async () => {
    const res = await request(app).delete('/api/users/nonexistentid');
    expect(res.statusCode).toBe(404);
  });

});