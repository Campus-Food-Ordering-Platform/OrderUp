import pool from '../../config/db';
import { OrderStatus } from './order.status';
import { Order, CreateOrderDTO } from './order.model';

// Create a new order in the database and return the created order
export async function createOrder(data: CreateOrderDTO): Promise<Order> {
  const result = await pool.query(
    `INSERT INTO orders (vendor_id, customer_id, customer_name, items, total_amount, note, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [data.vendor_id, data.customer_id, data.customer_name, JSON.stringify(data.items), data.total_amount, data.note ?? null, OrderStatus.Confirmed]
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
}//this function retrieves the most recent active order for a student, excluding any orders that have already been collected. This is useful for the student dashboard to show the current order status without displaying past completed orders.