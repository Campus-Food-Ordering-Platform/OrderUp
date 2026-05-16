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
export async function getActiveOrderByStudent(userId: string): Promise<Order | null> {
  const result = await pool.query(
    `SELECT * FROM orders 
     WHERE customer_id = $1 
     AND status NOT IN ('collected')
     ORDER BY created_at DESC 
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] ?? null;
}

// Get full order history for a student (order history page)
export async function getOrdersByStudent(userId: string): Promise<Order[]> {
  const result = await pool.query(
    `SELECT o.*, v.vendor_name, v.logo_url, v.banner_url
     FROM orders o
     JOIN vendors v ON o.vendor_id = v.id
     WHERE o.customer_id = $1 
     ORDER BY o.created_at DESC`,
    [userId]
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



// Add this new function to update rating and review
export async function updateOrderRating(
  orderId: string, 
  rating: number, 
  review?: string
): Promise<Order> {
  const result = await pool.query(
    `UPDATE orders 
     SET rating = $1, review = $2 
     WHERE id = $3 
     RETURNING *`,
    [rating, review || null, orderId]
  );
  return result.rows[0];
}

// Optional: Check if order is already rated
export async function getOrderRatingStatus(orderId: string): Promise<{ rating?: number; review?: string }> {
  const result = await pool.query(
    `SELECT rating, review FROM orders WHERE id = $1`,
    [orderId]
  );
  return result.rows[0] || {};
}

// Optional: Get all rated orders for a product/vendor (for analytics)
export async function getRatingsByVendor(vendorId: string) {
  const result = await pool.query(
    `SELECT o.rating, o.review, o.created_at, p.name AS customer_name
     FROM orders o
     JOIN profiles p ON o.customer_id = p.id
     WHERE o.vendor_id = $1
     AND o.rating IS NOT NULL`,
    [vendorId]
  );
  return result.rows;
}

// Optional: Get average rating for a vendor
export async function getAverageRatingForVendor(vendorId: string) {
  const result = await pool.query(
    `SELECT 
       ROUND(AVG(rating)::numeric, 1) as average_rating,
       COUNT(rating) as total_ratings,
       COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
       COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
       COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
       COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
       COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
     FROM orders 
     WHERE vendor_id = $1 
     AND rating IS NOT NULL`,
    [vendorId]
  );
  const stats = result.rows[0];

  return { averageRating: stats.average_rating ? parseFloat(stats.average_rating) : null,
    totalRatings: parseInt(stats.total_ratings) || 0,
    distribution: {
      5: parseInt(stats.five_star) || 0,
      4: parseInt(stats.four_star) || 0,
      3: parseInt(stats.three_star) || 0,
      2: parseInt(stats.two_star) || 0,
      1: parseInt(stats.one_star) || 0
    }
  };
}