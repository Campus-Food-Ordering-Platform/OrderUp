import request from 'supertest';
import { paymentService } from '../src/modules/payments/payment.service';
// Mock BEFORE importing app
jest.mock('../src/config/db', () => ({
  default: {
    query: jest.fn(),
    connect: jest.fn(),
  }
}));

// Bypass auth middleware so protected routes (e.g. /api/menu) don't return 401
jest.mock('../src/common/middleware/requireAuth', () => ({
  requireAuth: (_req: any, _res: any, next: any) => next(),
}));

import app from '../src/app';
import pool from '../src/config/db';

const mockQuery = jest.fn();
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};
(pool as any).query = mockQuery;
(pool as any).connect = jest.fn().mockResolvedValue(mockClient);

beforeEach(() => {
  mockQuery.mockReset();
  mockClient.query.mockReset();
  mockClient.release.mockReset();
});

// ─────────────────────────────────────────────
// Health , to be honest this is just here from testing how jest works
// ─────────────────────────────────────────────
describe('Health Check', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────
describe('Auth Endpoints', () => {

  it('POST /api/auth/signup should return 400 if fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ auth0Id: 'test-123' });
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
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
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

    expect(res.statusCode).toBe(201);
    expect(res.body.isNew).toBe(true);
    expect(res.body.user.name).toBe('John Doe');
  });

  it('POST /api/auth/signup should return 200 if user already exists', async () => {
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

  it('POST /api/auth/signup should return 500 if DB throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ auth0Id: 'google-oauth2|test123', name: 'John Doe', role: 'customer' });

    expect(res.statusCode).toBe(500);
  });

  it('GET /api/auth/me/:auth0Id should return 404 if user not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get(`/api/auth/me/${encodeURIComponent('google-oauth2|test123')}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('GET /api/auth/me/:auth0Id should return user if found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{
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

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Vendors
// ─────────────────────────────────────────────
describe('Vendor Endpoints', () => {

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

  it('GET /api/vendors should return 500 if DB throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/vendors');
    expect(res.statusCode).toBe(500);
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

  // ── Menu ──

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

  // FIXED: createMenuItem uses a transaction — mock mockClient.query, not mockQuery
  it('POST /api/vendors/:id/menu should add a menu item', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })  // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'item-1', name: 'Margherita', price: 50, category: 'Pizza' }] })  // INSERT menu_items
      .mockResolvedValueOnce({ rows: [] }); // COMMIT (allergens/tags loops are empty so no extra queries)

    const res = await request(app)
      .post('/api/vendors/vendor-1/menu')
      .send({ name: 'Margherita', price: 50, category: 'Pizza' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Margherita');
  });

  it('POST /api/vendors/:id/menu should return 400 if name or price missing', async () => {
    const res = await request(app)
      .post('/api/vendors/vendor-1/menu')
      .send({ description: 'No name or price' });
    expect(res.statusCode).toBe(400);
  });

  // FIXED: updateMenuItem uses a transaction — mock mockClient.query, not mockQuery
  it('PUT /api/vendors/:id/menu/:itemId should update a menu item', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })  // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'item-1', name: 'Updated Pizza', price: 60 }] })  // UPDATE menu_items
      .mockResolvedValueOnce({ rows: [] })  // DELETE FROM menu_item_allergens
      .mockResolvedValueOnce({ rows: [] })  // DELETE FROM menu_item_dietary_tags
      .mockResolvedValueOnce({ rows: [] }); // COMMIT

    const res = await request(app)
      .put('/api/vendors/vendor-1/menu/item-1')
      .send({ name: 'Updated Pizza', price: 60 });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Pizza');
  });

  // FIXED: uses transaction client — empty UPDATE rows means null return → 404
  it('PUT /api/vendors/:id/menu/:itemId should return 404 if item not found', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })  // BEGIN
      .mockResolvedValueOnce({ rows: [] })  // UPDATE → no rows found → returns null → 404
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    const res = await request(app)
      .put('/api/vendors/vendor-1/menu/nonexistent')
      .send({ name: 'Updated', price: 60 });
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/vendors/:id/menu/:itemId should delete a menu item', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/vendors/vendor-1/menu/item-1');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Menu item deleted');
  });

  // ── Register ──

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

  it('POST /api/vendors/register should return 400 if profile_id missing', async () => {
    const res = await request(app)
      .post('/api/vendors/register')
      .send({ description: 'No profile id' });
    expect(res.statusCode).toBe(400);
  });

  // ── Admin ──

  it('GET /api/vendors/admin/all should return all vendors for admin', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'vendor-1', vendor_name: 'Pizza Place', vendor_status: 'active', owner_name: 'John', revenue: '1000', orders: '5' },
        { id: 'vendor-2', vendor_name: 'Burger Barn', vendor_status: 'suspended', owner_name: 'Jane', revenue: '500', orders: '2' }
      ]
    });

    const res = await request(app).get('/api/vendors/admin/all');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('GET /api/vendors/admin/all should return 500 if DB throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/vendors/admin/all');
    expect(res.statusCode).toBe(500);
  });

  it('PATCH /api/vendors/:id/status should update vendor status to suspended', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'vendor-1', status: 'suspended' }]
    });

    const res = await request(app)
      .patch('/api/vendors/vendor-1/status')
      .send({ status: 'suspended' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('suspended');
  });

  it('PATCH /api/vendors/:id/status should update vendor status to active', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'vendor-1', status: 'active' }]
    });

    const res = await request(app)
      .patch('/api/vendors/vendor-1/status')
      .send({ status: 'active' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('active');
  });

  it('PATCH /api/vendors/:id/status should return 400 if status missing', async () => {
    const res = await request(app)
      .patch('/api/vendors/vendor-1/status')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('PATCH /api/vendors/:id/status should return 400 if status is invalid', async () => {
    const res = await request(app)
      .patch('/api/vendors/vendor-1/status')
      .send({ status: 'approved' });
    expect(res.statusCode).toBe(400);
  });

  it('PATCH /api/vendors/:id/status should return 404 if vendor not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch('/api/vendors/nonexistent/status')
      .send({ status: 'suspended' });
    expect(res.statusCode).toBe(404);
  });
});

// ─────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────
describe('Order Endpoints', () => {

  it('POST /api/orders should create an order', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'internal-user-uuid' }] })
      .mockResolvedValueOnce({ rows: [{
        id: 'order-1',
        vendor_id: 'vendor-1',
        customer_id: 'internal-user-uuid',
        customer_name: 'John Doe',
        items: [{ name: 'Pizza', price: 50, quantity: 1 }],
        total_amount: 50,
        status: 'received',
        note: null,
        created_at: new Date()
      }]});

    const res = await request(app)
      .post('/api/orders')
      .send({
        vendor_id: 'vendor-1',
        customer_id: 'auth0|test123',
        customer_name: 'John Doe',
        items: [{ name: 'Pizza', price: 50, quantity: 1 }],
        total_amount: 50,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('received');
  });

  it('POST /api/orders should return 500 if customer profile not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/orders')
      .send({
        vendor_id: 'vendor-1',
        customer_id: 'auth0|ghost',
        customer_name: 'Ghost',
        items: [],
        total_amount: 0,
      });

    expect(res.statusCode).toBe(500);
  });

  it('GET /api/orders/admin/all should return all orders', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'order-1', vendor_name: 'Pizza Place', customer_name: 'John', total_amount: 50, status: 'received' },
        { id: 'order-2', vendor_name: 'Burger Barn', customer_name: 'Jane', total_amount: 80, status: 'preparing' },
      ]
    });

    const res = await request(app).get('/api/orders/admin/all');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('GET /api/orders/admin/all should return 500 if DB throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/orders/admin/all');
    expect(res.statusCode).toBe(500);
  });

  it('GET /api/orders/vendor/:vendorId should return vendor orders', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'order-1', vendor_id: 'vendor-1', status: 'received', total_amount: 50 }
      ]
    });

    const res = await request(app).get('/api/orders/vendor/vendor-1');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('GET /api/orders/:orderId/status should return order status', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'order-1', status: 'received' }]
    });

    const res = await request(app).get('/api/orders/order-1/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('received');
  });

  it('GET /api/orders/:orderId/status should return 404 if not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/orders/nonexistent/status');
    expect(res.statusCode).toBe(404);
  });

  it('PATCH /api/orders/:orderId/status should advance order status', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'order-1', status: 'received' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'order-1', status: 'preparing' }] });

    const res = await request(app).patch('/api/orders/order-1/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('preparing');
  });

  it('PATCH /api/orders/:orderId/status should return 400 if order is at final status', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'order-1', status: 'collected' }]
    });

    const res = await request(app).patch('/api/orders/order-1/status');
    expect(res.statusCode).toBe(400);
  });

  it('PATCH /api/orders/:orderId/status should return 404 if order not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).patch('/api/orders/nonexistent/status');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/orders/student/:studentId/active should return active order', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'order-1', status: 'received' }]
    });

    const res = await request(app).get('/api/orders/student/some-plain-uuid/active');
    console.log('STATUS:', res.statusCode, 'BODY:', JSON.stringify(res.body));
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('received');
  });

  it('GET /api/orders/student/:studentId/active should return 404 if no active order', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/orders/student/some-plain-uuid/active');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/orders/student-history/:studentId should return order history', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'order-1', status: 'collected', total_amount: 50, vendor_name: 'Pizza Place' },
        { id: 'order-2', status: 'collected', total_amount: 80, vendor_name: 'Burger Barn' },
      ]
    });

    const res = await request(app).get('/api/orders/student-history/internal-uuid');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });
});

// ─────────────────────────────────────────────
// Payment Endpoints
// ─────────────────────────────────────────────
describe('Payment Endpoints', () => {

  it('POST /api/payments/initialize should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/api/payments/initialize')
      .send({ amount: 5000, orderId: 'order-1' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email, amount and orderId are required');
  });

  it('POST /api/payments/initialize should return 400 if amount is missing', async () => {
    const res = await request(app)
      .post('/api/payments/initialize')
      .send({ email: 'test@test.com', orderId: 'order-1' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email, amount and orderId are required');
  });

  it('POST /api/payments/initialize should return 400 if orderId is missing', async () => {
    const res = await request(app)
      .post('/api/payments/initialize')
      .send({ email: 'test@test.com', amount: 5000 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email, amount and orderId are required');
  });

  it('POST /api/payments/initialize should return 500 if paymentService throws', async () => {
    jest.spyOn(paymentService, 'initializePayment').mockRejectedValueOnce(new Error('Paystack error'));

    const res = await request(app)
      .post('/api/payments/initialize')
      .send({ email: 'test@test.com', amount: 5000, orderId: 'order-1' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Error initializing payment');
  });

  it('POST /api/payments/initialize should return 200 with paymentUrl and reference', async () => {
    jest.spyOn(paymentService, 'initializePayment').mockResolvedValueOnce({
      authorization_url: 'https://paystack.com/pay/abc123',
      reference: 'order_order-1_1234567890',
    });

    const res = await request(app)
      .post('/api/payments/initialize')
      .send({ email: 'test@test.com', amount: 5000, orderId: 'order-1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.paymentUrl).toBe('https://paystack.com/pay/abc123');
    expect(res.body.reference).toBe('order_order-1_1234567890');
  });

  it('GET /api/payments/verify/:reference should return 200 if payment is successful', async () => {
    jest.spyOn(paymentService, 'verifyPayment').mockResolvedValueOnce({
      status: 'success',
      reference: 'order_order-1_1234567890',
    });

    const res = await request(app).get('/api/payments/verify/order_order-1_1234567890');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Payment successful');
  });

  it('GET /api/payments/verify/:reference should return 400 if payment failed', async () => {
    jest.spyOn(paymentService, 'verifyPayment').mockResolvedValueOnce({
      status: 'failed',
      reference: 'order_order-1_1234567890',
    });

    const res = await request(app).get('/api/payments/verify/order_order-1_1234567890');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Payment failed or pending');
  });

  it('GET /api/payments/verify/:reference should return 400 if payment is pending', async () => {
    jest.spyOn(paymentService, 'verifyPayment').mockResolvedValueOnce({
      status: 'pending',
    });

    const res = await request(app).get('/api/payments/verify/some-ref');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/payments/verify/:reference should return 500 if verifyPayment throws', async () => {
    jest.spyOn(paymentService, 'verifyPayment').mockRejectedValueOnce(new Error('Network error'));

    const res = await request(app).get('/api/payments/verify/bad-ref');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Error verifying payment');
  });
});

// ─────────────────────────────────────────────
// Vendor Application Endpoints
// ─────────────────────────────────────────────
describe('Vendor Application Endpoints', () => {

  it('POST /api/vendors/applications/:id/approve should approve an application', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{
        id: 'app-1',
        profile_id: 'profile-123',
        name: 'Pizza Place',
        description: 'Best pizza',
        category: 'Food',
        location: 'Block A',
        operating_hours: '9am-5pm',
      }]})
      .mockResolvedValueOnce({ rows: [{ id: 'vendor-new', vendor_name: 'Pizza Place' }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post('/api/vendors/applications/app-1/approve');
    expect(res.statusCode).toBe(200);
    expect(res.body.vendor_name).toBe('Pizza Place');
  });

  it('POST /api/vendors/applications/:id/approve should return 500 if application not found', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post('/api/vendors/applications/nonexistent/approve');
    expect(res.statusCode).toBe(500);
  });

  it('POST /api/vendors/applications/:id/reject should reject an application', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'app-1', status: 'rejected', rejection_reason: 'Missing docs' }]
    });

    const res = await request(app)
      .post('/api/vendors/applications/app-1/reject')
      .send({ rejection_reason: 'Missing docs' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('rejected');
    expect(res.body.rejection_reason).toBe('Missing docs');
  });

  it('POST /api/vendors/applications/:id/reject should return 404 if application not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/vendors/applications/nonexistent/reject')
      .send({ rejection_reason: 'No reason' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Application not found');
  });

  it('POST /api/vendors/applications/:id/reject should work without a rejection_reason', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'app-1', status: 'rejected', rejection_reason: null }]
    });

    const res = await request(app)
      .post('/api/vendors/applications/app-1/reject')
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.rejection_reason).toBeNull();
  });
});

// ─────────────────────────────────────────────
// Analytics Endpoints
// ─────────────────────────────────────────────
describe('Analytics Endpoints', () => {

  it('GET /api/analytics/:vendor_id/revenue/export/csv should return CSV data', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { period: '2024-01-01T00:00:00.000Z', revenue: '1500.00' },
        { period: '2024-01-02T00:00:00.000Z', revenue: '2000.00' },
      ]
    });

    const res = await request(app)
      .get('/api/analytics/vendor-1/revenue/export/csv')
      .query({ interval: 'day' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/revenue-report\.csv/);
    expect(res.text).toContain('period');
    expect(res.text).toContain('revenue');
  });

  it('GET /api/analytics/:vendor_id/revenue/export/csv should default to day interval', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ period: '2024-01-01T00:00:00.000Z', revenue: '500.00' }]
    });

    const res = await request(app).get('/api/analytics/vendor-1/revenue/export/csv');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
  });

  it('GET /api/analytics/:vendor_id/revenue/export/csv should return 500 if DB throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/analytics/vendor-1/revenue/export/csv');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Export failed');
  });

  it('GET /api/analytics/:vendor_id/revenue/export/csv should return empty CSV if no data', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/analytics/vendor-1/revenue/export/csv');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('period');
  });
});

// ─────────────────────────────────────────────
// Additional Order Edge Cases
// ─────────────────────────────────────────────
describe('Order Edge Cases', () => {

  it('GET /api/orders/vendor/:vendorId should return 400 if vendorId is empty', async () => {
    const res = await request(app).get('/api/orders/vendor/');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/orders/vendor/:vendorId should return empty array if vendor has no orders', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/orders/vendor/vendor-no-orders');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('PATCH /api/orders/:orderId/status should advance from preparing to ready', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'order-2', status: 'preparing' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'order-2', status: 'ready' }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).patch('/api/orders/order-2/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ready');
  });

  it('PATCH /api/orders/:orderId/status should advance from ready to collected', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'order-3', status: 'ready' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'order-3', status: 'collected' }] });

    const res = await request(app).patch('/api/orders/order-3/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('collected');
  });

  it('GET /api/orders/student-history/:studentId should return empty array if no history', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/orders/student-history/student-no-orders');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// Additional Vendor Edge Cases
// ─────────────────────────────────────────────
describe('Vendor Edge Cases', () => {

  it('GET /api/vendors/:id/menu should return empty array if vendor has no menu items', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/vendors/vendor-1/menu');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('DELETE /api/vendors/:id/menu/:itemId should return 200 even if item did not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete('/api/vendors/vendor-1/menu/nonexistent-item');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Menu item deleted');
  });

  it('POST /api/vendors/register should return 500 if DB throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/vendors/register')
      .send({ profile_id: 'profile-123' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to register vendor');
  });

  it('PATCH /api/vendors/:id/status should return 500 if DB throws on valid status', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .patch('/api/vendors/vendor-1/status')
      .send({ status: 'active' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to update vendor status');
  });

  // FIXED: updateMenuItem is a transaction — reject on mockClient.query, not mockQuery
  it('PUT /api/vendors/:id/menu/:itemId should return 500 if DB throws', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })           // BEGIN
      .mockRejectedValueOnce(new Error('DB error')); // UPDATE throws → ROLLBACK → 500

    const res = await request(app)
      .put('/api/vendors/vendor-1/menu/item-1')
      .send({ name: 'Pizza', price: 50 });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to update menu item');
  });
});

// ─────────────────────────────────────────────
// Menu Module (/api/menu)
// ─────────────────────────────────────────────
describe('Menu Module — GET /api/menu/:vendorId', () => {
  it('returns 200 with an array of menu items for a valid vendor', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'item-1',
          vendor_id: 'vendor-1',
          name: 'Burger',
          price: 45,
          category: 'mains',
          available: true,
          allergens: ['gluten'],
          tags: ['halal'],
        },
      ],
    });

    const res = await request(app).get('/api/menu/vendor-1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Burger');
  });

  it('returns 200 with an empty array if vendor has no menu items', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/menu/vendor-empty');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/menu/vendor-bad');
    expect(res.statusCode).toBe(500);
  });
});

describe('Menu Module — POST /api/menu/', () => {
  it('creates a menu item and returns 201', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'item-new',
            vendor_id: 'vendor-1',
            name: 'Wrap',
            description: 'Chicken wrap',
            price: 55,
            image_url: 'https://example.com/wrap.jpg',
            category: 'mains',
            available: true,
          },
        ],
      }) // INSERT menu_items
      .mockResolvedValueOnce({ rows: [] }); // COMMIT (no allergens/tags)

    const res = await request(app).post('/api/menu/').send({
      vendorId: 'vendor-1',
      name: 'Wrap',
      description: 'Chicken wrap',
      price: 55,
      image_url: 'https://example.com/wrap.jpg',
      category: 'mains',
      available: true,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Wrap');
  });

  it('creates a menu item with allergens and tags (inserts into junction tables)', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({
        rows: [{ id: 'item-2', name: 'Pizza', price: 80, category: 'mains', vendor_id: 'vendor-1', available: true }],
      }) // INSERT menu_items
      .mockResolvedValueOnce({ rows: [] }) // INSERT allergen 'gluten'
      .mockResolvedValueOnce({ rows: [] }) // INSERT tag 'vegetarian'
      .mockResolvedValueOnce({ rows: [] }); // COMMIT

    const res = await request(app).post('/api/menu/').send({
      vendorId: 'vendor-1',
      name: 'Pizza',
      description: 'Margherita',
      price: 80,
      image_url: '',
      category: 'mains',
      available: true,
      allergens: ['gluten'],
      tags: ['vegetarian'],
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Pizza');
  });

  it('returns 500 if vendorId, name, or category is missing (service validation)', async () => {
    const res = await request(app).post('/api/menu/').send({
      name: 'No vendor',
      price: 30,
      category: 'mains',
    });
    expect(res.statusCode).toBe(500);
  });

  it('returns 500 if price is zero or negative', async () => {
    const res = await request(app).post('/api/menu/').send({
      vendorId: 'vendor-1',
      name: 'Free Item',
      price: 0,
      category: 'mains',
    });
    expect(res.statusCode).toBe(500);
  });

  it('returns 500 if the database throws during insert', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })           // BEGIN
      .mockRejectedValueOnce(new Error('DB error')); // INSERT throws

    const res = await request(app).post('/api/menu/').send({
      vendorId: 'vendor-1',
      name: 'Crash Item',
      price: 40,
      category: 'mains',
      available: true,
    });
    expect(res.statusCode).toBe(500);
  });
});

describe('Menu Module — PUT /api/menu/:itemId', () => {
  it('updates an existing menu item and returns 200', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({
        rows: [{ id: 'item-1', name: 'Updated Burger', price: 50, category: 'mains', vendor_id: 'vendor-1', available: true }],
      }) // UPDATE
      .mockResolvedValueOnce({ rows: [] }) // DELETE allergens
      .mockResolvedValueOnce({ rows: [] }) // DELETE tags
      .mockResolvedValueOnce({ rows: [] }); // COMMIT

    const res = await request(app).put('/api/menu/item-1').send({
      name: 'Updated Burger',
      price: 50,
      category: 'mains',
      available: true,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Burger');
  });

  it('returns 500 if the database throws during update', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })           // BEGIN
      .mockRejectedValueOnce(new Error('DB error')); // UPDATE throws

    const res = await request(app).put('/api/menu/item-bad').send({
      name: 'Crash',
      price: 10,
      category: 'mains',
    });
    expect(res.statusCode).toBe(500);
  });
});

describe('Menu Module — DELETE /api/menu/:itemId', () => {
  it('deletes a menu item and returns 204', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete('/api/menu/item-1');
    expect(res.statusCode).toBe(204);
  });

  it('returns 204 even when item does not exist (idempotent DELETE)', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete('/api/menu/nonexistent-item');
    expect(res.statusCode).toBe(204);
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).delete('/api/menu/item-crash');
    expect(res.statusCode).toBe(500);
  });
});

// ─────────────────────────────────────────────
// Analytics Endpoints (extended)
// ─────────────────────────────────────────────
describe('Analytics — GET /api/analytics/revenue/:vendor_id', () => {
  it('returns 200 with revenue series for a valid vendor', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { period: '2024-01-01T00:00:00.000Z', revenue: '1500.00' },
        { period: '2024-01-02T00:00:00.000Z', revenue: '2200.50' },
      ],
    });

    const res = await request(app).get('/api/analytics/revenue/vendor-1').query({ range: 'week' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('returns 200 with empty array when no revenue data', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/analytics/revenue/vendor-1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 400 for an invalid range value', async () => {
    const res = await request(app).get('/api/analytics/revenue/vendor-1').query({ range: 'century' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid range value');
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/analytics/revenue/vendor-1').query({ range: 'month' });
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to fetch revenue analytics');
  });

  it('supports all valid range values without error', async () => {
    const validRanges = ['day', 'week', 'month', '3 months', '6 months', 'year'];
    for (const range of validRanges) {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const res = await request(app).get('/api/analytics/revenue/vendor-1').query({ range });
      expect(res.statusCode).toBe(200);
    }
  });
});

describe('Analytics — GET /api/analytics/orders/:vendor_id', () => {
  it('returns 200 with orders series', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ period: '2024-01-01T00:00:00.000Z', orders: '10' }],
    });

    const res = await request(app).get('/api/analytics/orders/vendor-1').query({ range: 'week' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].orders).toBe('10');
  });

  it('returns 200 with empty array when no data', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/analytics/orders/vendor-1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 400 for an invalid range', async () => {
    const res = await request(app).get('/api/analytics/orders/vendor-1').query({ range: 'forever' });
    expect(res.statusCode).toBe(400);
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/analytics/orders/vendor-1');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to fetch order analytics');
  });
});

describe('Analytics — GET /api/analytics/customers/:vendor_id', () => {
  it('returns 200 with customer series', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ period: '2024-01-01T00:00:00.000Z', unique_customers: '5' }],
    });

    const res = await request(app).get('/api/analytics/customers/vendor-1').query({ range: 'month' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].unique_customers).toBe('5');
  });

  it('returns 400 for an invalid range', async () => {
    const res = await request(app).get('/api/analytics/customers/vendor-1').query({ range: 'quarterly' });
    expect(res.statusCode).toBe(400);
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/analytics/customers/vendor-1');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to fetch customer analytics');
  });
});

describe('Analytics — GET /api/analytics/items/:vendor_id', () => {
  it('returns 200 with top items list', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { name: 'Burger', weeklyOrders: '20', monthlyOrders: '80', weeklyRevenue: '900', monthlyRevenue: '3600' },
        { name: 'Pizza',  weeklyOrders: '15', monthlyOrders: '60', weeklyRevenue: '1200', monthlyRevenue: '4800' },
      ],
    });

    const res = await request(app).get('/api/analytics/items/vendor-1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].name).toBe('Burger');
  });

  it('returns 200 with empty data when no items have been ordered', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/analytics/items/vendor-new');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/analytics/items/vendor-bad');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to fetch item analytics');
  });
});

describe('Analytics — GET /api/analytics/graph/:vendor_id (combined dashboard)', () => {
  const makeGraphMocks = () => {
    mockQuery
      // Batch 1: series queries
      .mockResolvedValueOnce({ rows: [{ period: '2024-01-01', orders: '5' }] })
      .mockResolvedValueOnce({ rows: [{ period: '2024-01-01', revenue: '250.00' }] })
      .mockResolvedValueOnce({ rows: [{ period: '2024-01-01', unique_customers: '3' }] })
      .mockResolvedValueOnce({ rows: [{ name: 'Burger', monthlyRevenue: '1000' }] })
      // Batch 2: KPI summaries (current + previous)
      .mockResolvedValueOnce({ rows: [{ revenue: '1000.00' }] })
      .mockResolvedValueOnce({ rows: [{ orders: '20' }] })
      .mockResolvedValueOnce({ rows: [{ customers: '8' }] })
      .mockResolvedValueOnce({ rows: [{ revenue: '800.00' }] })
      .mockResolvedValueOnce({ rows: [{ orders: '15' }] })
      .mockResolvedValueOnce({ rows: [{ customers: '6' }] });
  };

  it('returns 200 with combined analytics payload', async () => {
    makeGraphMocks();

    const res = await request(app).get('/api/analytics/graph/vendor-1').query({ range: 'week' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('orders');
    expect(res.body.data).toHaveProperty('revenue');
    expect(res.body.data).toHaveProperty('customers');
    expect(res.body.data).toHaveProperty('items');
    expect(res.body.data).toHaveProperty('kpis');
    expect(res.body.data.kpis).toHaveProperty('revenue');
    expect(res.body.data.kpis).toHaveProperty('orders');
    expect(res.body.data.kpis).toHaveProperty('customers');
  });

  it('returns 200 with null range (all-time view)', async () => {
    makeGraphMocks();

    const res = await request(app).get('/api/analytics/graph/vendor-1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 for an invalid range', async () => {
    const res = await request(app).get('/api/analytics/graph/vendor-1').query({ range: 'eternity' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Analytics — GET /api/analytics/items/:vendor_id/timeseries', () => {
  it('returns 200 with item time series data', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { name: 'Burger', week: '2024-01-01T00:00:00.000Z', quantity: '12' },
        { name: 'Burger', week: '2024-01-08T00:00:00.000Z', quantity: '18' },
      ],
    });

    const res = await request(app).get('/api/analytics/items/vendor-1/timeseries');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('returns 200 with empty array when no time series data', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/analytics/items/vendor-new/timeseries');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/analytics/items/vendor-bad/timeseries');
    expect(res.statusCode).toBe(500);
  });
});

// ─────────────────────────────────────────────
// Order Ratings
// ─────────────────────────────────────────────
describe('Orders — POST /api/orders/:orderId/rating', () => {
  const validOrder = {
    id: 'order-1',
    vendor_id: 'vendor-1',
    customer_id: 'student-uuid',
    status: 'collected',
    rating: null,
    review: null,
  };

  it('submits a rating successfully and returns 200', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [validOrder] })
      .mockResolvedValueOnce({ rows: [{ ...validOrder, rating: 5, review: 'Great food!' }] });

    const res = await request(app)
      .post('/api/orders/order-1/rating')
      .send({ rating: 5, review: 'Great food!', studentId: 'student-uuid' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.review).toBe('Great food!');
  });

  it('returns 400 if rating is missing', async () => {
    const res = await request(app)
      .post('/api/orders/order-1/rating')
      .send({ studentId: 'student-uuid' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Rating must be between/);
  });

  it('returns 400 if rating is below 1', async () => {
    const res = await request(app)
      .post('/api/orders/order-1/rating')
      .send({ rating: 0, studentId: 'student-uuid' });

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 if rating is above 5', async () => {
    const res = await request(app)
      .post('/api/orders/order-1/rating')
      .send({ rating: 6, studentId: 'student-uuid' });

    expect(res.statusCode).toBe(400);
  });

  it('returns 401 if studentId is missing', async () => {
    const res = await request(app)
      .post('/api/orders/order-1/rating')
      .send({ rating: 4 });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('returns 404 if order does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/orders/nonexistent/rating')
      .send({ rating: 4, studentId: 'student-uuid' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Order not found');
  });

  it('returns 403 if the student does not own the order', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ ...validOrder, customer_id: 'other-student' }] });

    const res = await request(app)
      .post('/api/orders/order-1/rating')
      .send({ rating: 3, studentId: 'student-uuid' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/Unauthorized/);
  });

  it('returns 400 if the order has not been collected yet', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ ...validOrder, status: 'ready' }] });

    const res = await request(app)
      .post('/api/orders/order-1/rating')
      .send({ rating: 4, studentId: 'student-uuid' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/collected/);
  });

  it('returns 400 if the order has already been rated', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ ...validOrder, rating: 4 }] });

    const res = await request(app)
      .post('/api/orders/order-1/rating')
      .send({ rating: 5, studentId: 'student-uuid' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/already rated/);
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/orders/order-1/rating')
      .send({ rating: 4, studentId: 'student-uuid' });

    expect(res.statusCode).toBe(500);
  });
});

describe('Orders — GET /api/orders/vendor/:vendorId/ratings', () => {
  it('returns 200 with average rating and distribution', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        average_rating: '4.3',
        total_ratings: '10',
        five_star: '5',
        four_star: '3',
        three_star: '1',
        two_star: '1',
        one_star: '0',
      }],
    });

    const res = await request(app).get('/api/orders/vendor/vendor-1/ratings');
    expect(res.statusCode).toBe(200);
    expect(res.body.averageRating).toBe(4.3);
    expect(res.body.totalRatings).toBe(10);
    expect(res.body.distribution).toHaveProperty('5');
  });

  it('returns 200 with null averageRating when no ratings exist', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        average_rating: null,
        total_ratings: '0',
        five_star: '0',
        four_star: '0',
        three_star: '0',
        two_star: '0',
        one_star: '0',
      }],
    });

    const res = await request(app).get('/api/orders/vendor/vendor-new/ratings');
    expect(res.statusCode).toBe(200);
    expect(res.body.averageRating).toBeNull();
    expect(res.body.totalRatings).toBe(0);
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/orders/vendor/vendor-bad/ratings');
    expect(res.statusCode).toBe(500);
  });
});

describe('Orders — GET /api/orders/student/:studentId/active-all', () => {
  it('returns 200 with all active orders for a student', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'order-1', status: 'received',  vendor_name: 'Pizza Place' },
        { id: 'order-2', status: 'preparing', vendor_name: 'Burger Barn' },
      ],
    });

    const res = await request(app).get('/api/orders/student/student-uuid/active-all');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].vendor_name).toBe('Pizza Place');
  });

  it('returns 200 with empty array if no active orders', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/orders/student/student-uuid/active-all');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/orders/student/student-bad/active-all');
    expect(res.statusCode).toBe(500);
  });
});

// ─────────────────────────────────────────────
// Uploads (/api/upload)
// ─────────────────────────────────────────────
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    utils: {
      api_sign_request: jest.fn().mockReturnValue('mock-signature'),
    },
    uploader: {
      upload: jest.fn(),
    },
  },
}));

import { v2 as cloudinary } from 'cloudinary';

describe('Uploads — GET /api/upload/sign', () => {
  it('returns 200 with timestamp, signature, apiKey, and cloudName', async () => {
    const res = await request(app).get('/api/upload/sign');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('signature');
    expect(typeof res.body.timestamp).toBe('number');
    expect(res.body.signature).toBe('mock-signature');
  });
});

describe('Uploads — POST /api/upload/', () => {
  beforeEach(() => {
    (cloudinary.uploader.upload as jest.Mock).mockReset();
  });

  it('returns 200 with the secure URL after a successful upload', async () => {
    (cloudinary.uploader.upload as jest.Mock).mockResolvedValueOnce({
      secure_url: 'https://res.cloudinary.com/demo/image/upload/menu-items/burger.jpg',
    });

    const res = await request(app)
      .post('/api/upload/')
      .send({ base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB...' });

    expect(res.statusCode).toBe(200);
    expect(res.body.url).toBe('https://res.cloudinary.com/demo/image/upload/menu-items/burger.jpg');
  });

  it('returns 400 if base64 is missing from the body', async () => {
    const res = await request(app).post('/api/upload/').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('base64 image is required');
  });

  it('returns 500 if cloudinary upload throws', async () => {
    (cloudinary.uploader.upload as jest.Mock).mockRejectedValueOnce(new Error('Cloudinary error'));

    const res = await request(app)
      .post('/api/upload/')
      .send({ base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB...' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to upload image');
  });
});

// ─────────────────────────────────────────────
// Order Status — full transition chain
// ─────────────────────────────────────────────
describe('Order Status — full transition chain via API', () => {
  it('advances through received → preparing → ready → collected', async () => {
    // received → preparing
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'order-chain', status: 'received' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'order-chain', status: 'preparing' }] });
    let res = await request(app).patch('/api/orders/order-chain/status');
    expect(res.body.status).toBe('preparing');

    // preparing → ready (push notification path: no subscriptions found)
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'order-chain', status: 'preparing', customer_id: 'cust-1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'order-chain', status: 'ready' }] })
      .mockResolvedValueOnce({ rows: [] }); // push_subscriptions query
    res = await request(app).patch('/api/orders/order-chain/status');
    expect(res.body.status).toBe('ready');

    // ready → collected
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'order-chain', status: 'ready' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'order-chain', status: 'collected' }] });
    res = await request(app).patch('/api/orders/order-chain/status');
    expect(res.body.status).toBe('collected');
  });

  it('returns 400 when trying to advance past collected (final status)', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'order-done', status: 'collected' }] });

    const res = await request(app).patch('/api/orders/order-done/status');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Order is already at final status');
  });
});
// ─────────────────────────────────────────────
// NEW TESTS — append these to the bottom of app.test.ts
// Do not modify any existing tests above.
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Vendor Status Check  (POST /api/vendors/status)
// ─────────────────────────────────────────────
describe('Vendor Status Check — POST /api/vendors/status', () => {

  it('returns 400 if profile_id is missing', async () => {
    const res = await request(app)
      .post('/api/vendors/status')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('profile_id required');
  });

  it('returns { type: "none" } when no vendor or application exists', async () => {
    // getVendorStatusByProfileId: vendors query → no row, applications query → no row
    mockQuery
      .mockResolvedValueOnce({ rows: [] })  // vendors check
      .mockResolvedValueOnce({ rows: [] }); // applications check

    const res = await request(app)
      .post('/api/vendors/status')
      .send({ profile_id: 'profile-unknown' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ type: 'none' });
  });

  it('returns { type: "vendor", status: "active" } for an approved vendor', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'vendor-1', status: 'active', name: 'Pizza Place' }],
    });

    const res = await request(app)
      .post('/api/vendors/status')
      .send({ profile_id: 'profile-123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.type).toBe('vendor');
    expect(res.body.status).toBe('active');
    expect(res.body.name).toBe('Pizza Place');
  });

  it('returns { type: "vendor", status: "suspended" } for a suspended vendor', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'vendor-1', status: 'suspended', name: 'Suspended Stall' }],
    });

    const res = await request(app)
      .post('/api/vendors/status')
      .send({ profile_id: 'profile-suspended' });

    expect(res.statusCode).toBe(200);
    expect(res.body.type).toBe('vendor');
    expect(res.body.status).toBe('suspended');
  });

  it('returns { type: "application", status: "pending" } when application is pending', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] }) // no vendor row yet
      .mockResolvedValueOnce({
        rows: [{ id: 'app-1', status: 'pending', name: 'New Stall' }],
      });

    const res = await request(app)
      .post('/api/vendors/status')
      .send({ profile_id: 'profile-pending' });

    expect(res.statusCode).toBe(200);
    expect(res.body.type).toBe('application');
    expect(res.body.status).toBe('pending');
  });

  it('returns { type: "application", status: "rejected" } when application was rejected', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 'app-2', status: 'rejected', name: 'Rejected Stall' }],
      });

    const res = await request(app)
      .post('/api/vendors/status')
      .send({ profile_id: 'profile-rejected' });

    expect(res.statusCode).toBe(200);
    expect(res.body.type).toBe('application');
    expect(res.body.status).toBe('rejected');
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/vendors/status')
      .send({ profile_id: 'profile-crash' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to check status');
  });
});

// ─────────────────────────────────────────────
// Submit Vendor Application  (POST /api/vendors/applications)
// ─────────────────────────────────────────────
describe('Submit Vendor Application — POST /api/vendors/applications', () => {

  const validApplication = {
    profile_id: 'profile-123',
    name: 'Kota King',
    owner_name: 'Thabo Nkosi',
    owner_email: 'thabo@kota.co.za',
    description: 'Best kota in town',
    category: 'Fast Food',
    location: 'Matrix Food Court, Stall 4',
  };

  it('returns 201 with the new application on success', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'app-new',
        profile_id: 'profile-123',
        name: 'Kota King',
        status: 'pending',
      }],
    });

    const res = await request(app)
      .post('/api/vendors/applications')
      .send(validApplication);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Kota King');
    expect(res.body.status).toBe('pending');
  });

  it('returns 400 if profile_id is missing', async () => {
    const { profile_id, ...body } = validApplication;
    const res = await request(app)
      .post('/api/vendors/applications')
      .send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/profile_id/);
  });

  it('returns 400 if name (stall name) is missing', async () => {
    const { name, ...body } = validApplication;
    const res = await request(app)
      .post('/api/vendors/applications')
      .send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/[Vv]endor name/);
  });

  it('returns 400 if category is missing', async () => {
    const { category, ...body } = validApplication;
    const res = await request(app)
      .post('/api/vendors/applications')
      .send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/[Cc]ategory/);
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/vendors/applications')
      .send(validApplication);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to submit application');
  });
});

// ─────────────────────────────────────────────
// Pending Applications  (GET /api/vendors/applications/pending)
// ─────────────────────────────────────────────
describe('Pending Applications — GET /api/vendors/applications/pending', () => {

  it('returns 200 with a list of pending applications', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'app-1', vendor_name: 'Stall A', application_status: 'pending', owner_name: 'Alice' },
        { id: 'app-2', vendor_name: 'Stall B', application_status: 'pending', owner_name: 'Bob' },
      ],
    });

    const res = await request(app).get('/api/vendors/applications/pending');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].vendor_name).toBe('Stall A');
  });

  it('returns 200 with an empty array when there are no pending applications', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/vendors/applications/pending');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/vendors/applications/pending');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to fetch pending applications');
  });
});

// ─────────────────────────────────────────────
// Update Vendor Profile  (PUT /api/vendors/:id)
// ─────────────────────────────────────────────
describe('Update Vendor — PUT /api/vendors/:id', () => {

  it('returns 200 with the updated vendor on success', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'vendor-1',
        vendor_name: 'Updated Name',
        description: 'New description',
        category: 'Cafe',
        location: 'Block B',
      }],
    });

    const res = await request(app)
      .put('/api/vendors/vendor-1')
      .send({ vendor_name: 'Updated Name', description: 'New description', category: 'Cafe', location: 'Block B' });

    expect(res.statusCode).toBe(200);
    expect(res.body.vendor_name).toBe('Updated Name');
  });

  it('returns 404 if the vendor does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/api/vendors/nonexistent')
      .send({ vendor_name: 'Ghost Stall' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Vendor not found');
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/api/vendors/vendor-1')
      .send({ vendor_name: 'Crash Stall' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to update vendor');
  });

  it('accepts a partial update (only operating_hours)', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'vendor-1',
        vendor_name: 'Pizza Place',
        operating_hours: '{"Mon":{"open":true,"from":"08:00","to":"17:00"}}',
      }],
    });

    const res = await request(app)
      .put('/api/vendors/vendor-1')
      .send({ operating_hours: '{"Mon":{"open":true,"from":"08:00","to":"17:00"}}' });

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe('vendor-1');
  });
});

// ─────────────────────────────────────────────
// Analytics — CSV exports (orders & items)
// ─────────────────────────────────────────────
describe('Analytics — GET /api/analytics/:vendor_id/orders/export/csv', () => {

  it('returns CSV with period and orders columns', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { period: '2024-01-01T00:00:00.000Z', orders: '8' },
        { period: '2024-01-08T00:00:00.000Z', orders: '12' },
      ],
    });

    const res = await request(app).get('/api/analytics/vendor-1/orders/export/csv');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/peak-hours-report\.csv/);
    expect(res.text).toContain('period');
    expect(res.text).toContain('orders');
  });

  it('returns 200 with header-only CSV when there is no order data', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/analytics/vendor-1/orders/export/csv');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('period');
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/analytics/vendor-1/orders/export/csv');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Export failed');
  });
});

describe('Analytics — GET /api/analytics/:vendor_id/items/export/csv', () => {

  it('returns CSV with item sales columns', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { name: 'Burger', weeklyOrders: '20', monthlyOrders: '80', weeklyRevenue: '900.00', monthlyRevenue: '3600.00' },
        { name: 'Pizza',  weeklyOrders: '15', monthlyOrders: '60', weeklyRevenue: '1200.00', monthlyRevenue: '4800.00' },
      ],
    });

    const res = await request(app).get('/api/analytics/vendor-1/items/export/csv');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/items-report\.csv/);
    expect(res.text).toContain('name');
    expect(res.text).toContain('weeklyOrders');
    expect(res.text).toContain('monthlyRevenue');
  });

  it('returns 200 with header-only CSV when no items have been sold', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/analytics/vendor-new/items/export/csv');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('name');
  });

  it('returns 500 if the database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/analytics/vendor-bad/items/export/csv');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Export failed');
  });
});

// ─────────────────────────────────────────────
// Push Notification Subscription
// (POST /api/notifications/subscribe)
// ─────────────────────────────────────────────
describe('Notifications — POST /api/notifications/subscribe', () => {

  const validSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
    keys: { p256dh: 'key1', auth: 'key2' },
  };

  it('returns 201 on successful subscription save', async () => {
    // 1. Resolve Auth0 ID → internal profile UUID
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'internal-uuid-123' }] })
      // 2. INSERT / UPSERT push_subscriptions
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/notifications/subscribe')
      .send({ customer_id: 'auth0|test123', subscription: validSubscription });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 if customer_id is missing', async () => {
    const res = await request(app)
      .post('/api/notifications/subscribe')
      .send({ subscription: validSubscription });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/customer_id/);
  });

  it('returns 400 if subscription object is missing', async () => {
    const res = await request(app)
      .post('/api/notifications/subscribe')
      .send({ customer_id: 'auth0|test123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/subscription/);
  });

  it('returns 404 if the Auth0 ID does not match any profile', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // profile lookup returns nothing

    const res = await request(app)
      .post('/api/notifications/subscribe')
      .send({ customer_id: 'auth0|ghost', subscription: validSubscription });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Profile not found');
  });

  it('returns 500 if the database throws during profile lookup', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/notifications/subscribe')
      .send({ customer_id: 'auth0|crash', subscription: validSubscription });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to save subscription');
  });

  it('returns 500 if the database throws during upsert', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'internal-uuid-123' }] }) // profile found
      .mockRejectedValueOnce(new Error('DB error'));                   // upsert fails

    const res = await request(app)
      .post('/api/notifications/subscribe')
      .send({ customer_id: 'auth0|test123', subscription: validSubscription });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to save subscription');
  });
});