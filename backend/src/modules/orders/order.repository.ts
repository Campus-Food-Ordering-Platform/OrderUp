import pool from '../../config/db';
import { OrderStatus } from './order.status';
import { Order, CreateOrderDTO } from './order.model';

// Create a new order in the database and return the created order
export async function createOrder(data: CreateOrderDTO): Promise<Order> {
  // Look up the internal UUID from the Auth0 ID
  const profileResult = await pool.query(
    `SELECT id FROM profiles WHERE auth0_id = $1`,
    [data.customer_id]
  );

  const internalUserId = profileResult.rows[0]?.id;
  if (!internalUserId) throw new Error('Customer profile not found');

  const result = await pool.query(
    `INSERT INTO orders (vendor_id, customer_id, customer_name, items, total_amount, note, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [data.vendor_id, internalUserId, data.customer_name, JSON.stringify(data.items), data.total_amount, data.note ?? null, OrderStatus.Confirmed]
  );
  return result.rows[0];
}

// Get all orders for a vendor (called by vendor dashboard)
export async function getOrdersByVendor(vendorId: string): Promise<Order[]> {
  const result = await pool.query(
    `SELECT * FROM orders WHERE vendor_id = $1 ORDER BY created_at DESC`,
    [vendorId]
  );
  return result.rows;
}

// Get a single order by ID (called by student to poll status)
export async function getOrderById(orderId: string): Promise<Order | null> {
  const result = await pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [orderId]
  );
  return result.rows[0] ?? null;
}

// Update order status (called by vendor)
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const result = await pool.query(
    `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
    [status, orderId]
  );
  return result.rows[0];
}

export async function getActiveOrderByStudent(studentId: string): Promise<Order | null> {
  const result = await pool.query(
    `SELECT * FROM orders 
     WHERE customer_id = $1 
     AND status NOT IN ('collected')
     ORDER BY created_at DESC 
     LIMIT 1`,
    [studentId]
  );
  return result.rows[0] ?? null;
}

export async function getOrdersByStudent(studentId: string): Promise<Order[]> {//this is for the order history page
  const result = await pool.query(
    `SELECT o.*, p.name as vendor_name 
     FROM orders o
     JOIN vendors v ON o.vendor_id = v.id
     JOIN profiles p ON v.profile_id = p.id
     WHERE o.customer_id = $1 
     ORDER BY o.created_at DESC`,
    [studentId]
  );
  return result.rows;
}