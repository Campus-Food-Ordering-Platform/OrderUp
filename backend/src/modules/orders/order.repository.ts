import pool from '../../config/db';
import { OrderStatus } from './order.status';
import { Order, CreateOrderDTO } from './order.model';

// Create a new order — resolves Auth0 ID to internal UUID before inserting
export async function createOrder(data: CreateOrderDTO): Promise<Order> {
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

// Get a single order by its UUID (used for status polling)
export async function getOrderById(orderId: string): Promise<Order | null> {
  const result = await pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [orderId]
  );
  return result.rows[0] ?? null;
}

// Update order status (called by vendor when advancing through stages)
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const result = await pool.query(
    `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
    [status, orderId]
  );
  return result.rows[0];
}

// Get the student's most recent non-collected order
// Accepts the raw Auth0 ID — resolves to internal UUID via profiles table
export async function getActiveOrderByStudent(auth0Id: string): Promise<Order | null> {
  const profileResult = await pool.query(
    `SELECT id FROM profiles WHERE auth0_id = $1`,
    [auth0Id]
  );

  const internalUserId = profileResult.rows[0]?.id;
  if (!internalUserId) return null; // no profile found, return empty gracefully

  const result = await pool.query(
    `SELECT * FROM orders 
     WHERE customer_id = $1 
     AND status NOT IN ('collected')
     ORDER BY created_at DESC 
     LIMIT 1`,
    [internalUserId]
  );
  return result.rows[0] ?? null;
}

// Get full order history for a student (order history page)
// Accepts the raw Auth0 ID — resolves to internal UUID via profiles table
export async function getOrdersByStudent(auth0Id: string): Promise<Order[]> {
  const profileResult = await pool.query(
    `SELECT id FROM profiles WHERE auth0_id = $1`,
    [auth0Id]
  );

  const internalUserId = profileResult.rows[0]?.id;
  if (!internalUserId) return []; // no profile found, return empty array gracefully

  const result = await pool.query(
    `SELECT o.*, p.name as vendor_name 
     FROM orders o
     JOIN vendors v ON o.vendor_id = v.id
     JOIN profiles p ON v.profile_id = p.id
     WHERE o.customer_id = $1 
     ORDER BY o.created_at DESC`,
    [internalUserId]
  );
  return result.rows;
}

// Get all orders across all vendors (admin view)
export async function getAllOrdersAdmin(): Promise<Order[]> {
  const result = await pool.query(
    `SELECT o.*, p.name as vendor_name, cp.name as customer_name_resolved
     FROM orders o
     JOIN vendors v ON o.vendor_id = v.id
     JOIN profiles p ON v.profile_id = p.id
     JOIN profiles cp ON o.customer_id = cp.id
     ORDER BY o.created_at DESC`
  );
  return result.rows;
}