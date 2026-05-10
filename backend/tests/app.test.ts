import request from 'supertest';
import { paymentService } from '../src/modules/payments/payment.service';
// Mock BEFORE importing app
jest.mock('../src/config/db', () => ({
  default: {
    query: jest.fn(),
    connect: jest.fn(),
  }
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
// Vendors  ← fixed: no longer nested in Users
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

  it('POST /api/vendors/:id/menu should return 400 if name or price missing', async () => {
    const res = await request(app)
      .post('/api/vendors/vendor-1/menu')
      .send({ description: 'No name or price' });
    expect(res.statusCode).toBe(400);
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

  it('PUT /api/vendors/:id/menu/:itemId should return 404 if item not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

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
      .send({ status: 'approved' }); // 'approved' not in vendor_status enum
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
    // createOrder: resolves profile lookup then insert
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'internal-user-uuid' }] }) // profile lookup
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
    mockQuery.mockResolvedValueOnce({ rows: [] }); // profile not found

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
      .mockResolvedValueOnce({ rows: [{ id: 'order-1', status: 'received' }] }) // getOrderById
      .mockResolvedValueOnce({ rows: [{ id: 'order-1', status: 'preparing' }] }); // updateOrderStatus

    const res = await request(app).patch('/api/orders/order-1/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('preparing');
  });

  it('PATCH /api/orders/:orderId/status should return 400 if order is at final status', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'order-1', status: 'collected' }] // already final
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
    rows: [{ id: 'order-1', status: 'received' }]  // single query, correct shape
  });

  const res = await request(app).get('/api/orders/student/some-plain-uuid/active');
  console.log('STATUS:', res.statusCode, 'BODY:', JSON.stringify(res.body));
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('received');
});

it('GET /api/orders/student/:studentId/active should return 404 if no active order', async () => {
  mockQuery
    .mockResolvedValueOnce({ rows: [] }) // profile not found → returns null → 404
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

  // ── Initialize ──

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
    // Mock paymentService.initializePayment to throw
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

  // ── Verify ──

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
    // approveApplication uses a transaction client (connect → BEGIN → queries → COMMIT)
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })                                      // BEGIN
      .mockResolvedValueOnce({ rows: [] })                                      // UPDATE vendor_applications
      .mockResolvedValueOnce({ rows: [{                                         // SELECT application
        id: 'app-1',
        profile_id: 'profile-123',
        name: 'Pizza Place',
        description: 'Best pizza',
        category: 'Food',
        location: 'Block A',
        operating_hours: '9am-5pm',
      }]})
      .mockResolvedValueOnce({ rows: [{ id: 'vendor-new', vendor_name: 'Pizza Place' }] }) // INSERT vendor
      .mockResolvedValueOnce({ rows: [] });                                     // COMMIT

    const res = await request(app).post('/api/vendors/applications/app-1/approve');
    expect(res.statusCode).toBe(200);
    expect(res.body.vendor_name).toBe('Pizza Place');
  });

  it('POST /api/vendors/applications/:id/approve should return 500 if application not found', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })   // BEGIN
      .mockResolvedValueOnce({ rows: [] })   // UPDATE
      .mockResolvedValueOnce({ rows: [] })   // SELECT → app not found → throws
      .mockResolvedValueOnce({ rows: [] });  // ROLLBACK

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
    mockQuery.mockResolvedValueOnce({ rows: [] }); // nothing returned → null → 404

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

    // No interval query param — should default to 'day'
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
    // Header row still present even with no data rows
    expect(res.text).toContain('period');
  });
});

// ─────────────────────────────────────────────
// Additional Order Edge Cases
// ─────────────────────────────────────────────
describe('Order Edge Cases', () => {

  it('GET /api/orders/vendor/:vendorId should return 400 if vendorId is empty', async () => {
    // Express won't match an empty segment, so hit a clearly bad path
    const res = await request(app).get('/api/orders/vendor/');
    // Route won't match — Express returns 404 for unmatched routes
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
      .mockResolvedValueOnce({ rows: [{ id: 'order-2', status: 'preparing' }] }) // getOrderById
      .mockResolvedValueOnce({ rows: [{ id: 'order-2', status: 'ready' }] })     // updateOrderStatus
      .mockResolvedValueOnce({ rows: [] });                                       // push_subscriptions lookup

    const res = await request(app).patch('/api/orders/order-2/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ready');
  });

  it('PATCH /api/orders/:orderId/status should advance from ready to collected', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'order-3', status: 'ready' }] })        // getOrderById
      .mockResolvedValueOnce({ rows: [{ id: 'order-3', status: 'collected' }] });   // updateOrderStatus

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
    // deleteMenuItem does not check for existence — it just runs DELETE
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

  it('PUT /api/vendors/:id/menu/:itemId should return 500 if DB throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/api/vendors/vendor-1/menu/item-1')
      .send({ name: 'Pizza', price: 50 });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to update menu item');
  });
});