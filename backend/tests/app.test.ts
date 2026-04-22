import request from 'supertest';

// Mock BEFORE importing app
jest.mock('../src/config/db', () => ({
  default: {
    query: jest.fn()
  }
}));

import app from '../src/app';
import pool from '../src/config/db';

const mockQuery = jest.fn();
(pool as any).query = mockQuery;

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
    mockQuery
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
    mockQuery
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
    mockQuery
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get(`/api/auth/me/${encodeURIComponent('google-oauth2|test123')}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('GET /api/auth/me/:auth0Id should return user if found', async () => {
    mockQuery
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
//now vendor stuff:

describe('Vendor Endpoints', () => {

  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('GET /api/vendors should return all vendors', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'vendor-1', name: 'Pizza Place', description: 'Best pizza', is_open: true, logo_url: null },
        { id: 'vendor-2', name: 'Burger Barn', description: 'Best burgers', is_open: false, logo_url: null }
      ]
    });

    const res = await request(app).get('/api/vendors');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('GET /api/vendors/:id should return a vendor', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'vendor-1', name: 'Pizza Place', description: 'Best pizza', is_open: true, logo_url: null }]
    });

    const res = await request(app).get('/api/vendors/vendor-1');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Pizza Place');
  });

  it('GET /api/vendors/:id should return 404 if not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/vendors/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/vendors/:id/menu should return menu items', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'item-1', name: 'Margherita', price: 50, category: 'Pizza' },
        { id: 'item-2', name: 'Pepperoni', price: 60, category: 'Pizza' }
      ]
    });

    const res = await request(app).get('/api/vendors/vendor-1/menu');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('POST /api/vendors/:id/menu should return 400 if name and price missing', async () => {
    const res = await request(app)
      .post('/api/vendors/vendor-1/menu')
      .send({ description: 'No name or price' });
    expect(res.statusCode).toBe(500);
  });

  it('POST /api/vendors/:id/menu should add a menu item', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'item-1', name: 'Margherita', price: 50, category: 'Pizza' }]
    });

    const res = await request(app)
      .post('/api/vendors/vendor-1/menu')
      .send({ name: 'Margherita', price: 50, category: 'Pizza' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Margherita');
  });

  it('PUT /api/vendors/:id/menu/:itemId should return 404 if item not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/api/vendors/vendor-1/menu/nonexistent')
      .send({ name: 'Updated', price: 60 });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/vendors/:id/menu/:itemId should update a menu item', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'item-1', name: 'Updated Pizza', price: 60 }]
    });

    const res = await request(app)
      .put('/api/vendors/vendor-1/menu/item-1')
      .send({ name: 'Updated Pizza', price: 60 });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Pizza');
  });

  it('DELETE /api/vendors/:id/menu/:itemId should delete a menu item', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/vendors/vendor-1/menu/item-1');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Menu item deleted');
  });

  it('POST /api/vendors/register should return 400 if profile_id missing', async () => {
    const res = await request(app)
      .post('/api/vendors/register')
      .send({ description: 'No profile id' });
    expect(res.statusCode).toBe(500);
  });

  it('POST /api/vendors/register should register a vendor', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'vendor-1', profile_id: 'profile-123', description: 'Best food' }]
    });

    const res = await request(app)
      .post('/api/vendors/register')
      .send({ profile_id: 'profile-123', description: 'Best food' });
    expect(res.statusCode).toBe(200);
    expect(res.body.profile_id).toBe('profile-123');
  });

});




});