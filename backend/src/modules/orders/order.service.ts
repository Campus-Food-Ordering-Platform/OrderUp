import * as orderRepo from './order.repository';
import { CreateOrderDTO, RateOrderDTO, Order } from './order.model';

import { OrderStatus, STATUS_TRANSITIONS } from './order.status';
import pool from '../../config/db';
import { sendPushNotification } from '../notifications/notification.service';

// Place a new order (Auth0 ID resolution happens inside createOrder)
export async function placeOrder(data: CreateOrderDTO) {
  return await orderRepo.createOrder(data);
}

// Push notification messages for each status transition the student cares about
const PUSH_MESSAGES: Record<string, { title: string; body: string }> = {
  [OrderStatus.Preparing]: {
    title: '👨‍🍳 Being prepared!',
    body: 'Your order is now being prepared.',
  },
  [OrderStatus.Ready]: {
    title: '✅ Ready for pickup!',
    body: 'Your order is ready — come collect it at The Matrix Food Court!',
  },
  [OrderStatus.Collected]: {
    title: '🎉 Enjoy your meal!',
    body: 'Your order has been collected. Enjoy!',
  },
};

// Fetch all orders for a vendor's dashboard
export async function getVendorOrders(vendorId: string) {
  return await orderRepo.getOrdersByVendor(vendorId);
}

// Fetch a single order's status (used by student for polling)
export async function getOrderStatus(orderId: string) {
  const order = await orderRepo.getOrderById(orderId);
  if (!order) throw new Error('Order not found');
  return order;
}

// Advance an order to the next status and send a push notification if ready
export async function advanceOrderStatus(orderId: string) {
  const order = await orderRepo.getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  console.log('order.status from DB:', order.status);
  console.log('STATUS_TRANSITIONS keys:', Object.keys(STATUS_TRANSITIONS));

  const nextStatus = STATUS_TRANSITIONS[order.status as OrderStatus];
  if (!nextStatus) throw new Error('Order is already at final status');

  const updated = await orderRepo.updateOrderStatus(orderId, nextStatus);

  // Notify the student when their order is ready for pickup
  if (nextStatus === OrderStatus.Ready) {
    try {
      const subResult = await pool.query(
        `SELECT subscription FROM push_subscriptions WHERE customer_id = $1`,
        [order.customer_id]
      );

      for (const row of subResult.rows) {
        await sendPushNotification(row.subscription, {
          title: '🛎️ Order Ready!',
          body: 'Your order is ready to collect at The Matrix Food Court!',
        });
      }
    } catch (err) {
      console.error('Failed to send push notification:', err);
    }
  }

  return updated;
}

// Get the student's current active order (Auth0 ID passed in, resolved in repository)
export async function getStudentActiveOrder(studentId: string) {
  return await orderRepo.getActiveOrderByStudent(studentId);
}
// get all the vendors (it allows us to show all active orders)
export async function getAllActiveOrdersByStudent(userId: string): Promise<Order[]> {
  const result = await pool.query(
    `SELECT o.*, p.name as vendor_name
     FROM orders o
     JOIN vendors v ON o.vendor_id = v.id
     JOIN profiles p ON v.profile_id = p.id
     WHERE o.customer_id = $1
     AND o.status NOT IN ('collected')
     ORDER BY o.created_at ASC`,
    [userId]
  );
  return result.rows;
}

// Get full order history for a student (Auth0 ID passed in, resolved in repository)
export async function getStudentHistory(studentId: string) {
  return orderRepo.getOrdersByStudent(studentId);
}

// Fetch all orders for the admin view
export async function getAllOrdersForAdmin() {
  return await orderRepo.getAllOrdersAdmin();
}



// Rate an order (submit rating and review)
export async function rateOrder(orderId: string, customerId: string, ratingData: RateOrderDTO) {
  const order = await orderRepo.getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  console.log('🔍 order.customer_id from DB:', order.customer_id);
  console.log('🔍 customerId sent from frontend:', customerId);
  console.log('🔍 match?', order.customer_id === customerId);
  // ...
  // 2. Verify this customer owns the order
  if (order.customer_id !== customerId) {
    throw new Error('Unauthorized: You can only rate your own orders');
  }
  
  // 3. Check if order is collected (can only rate after collecting)
  if (order.status !== OrderStatus.Collected) {
    throw new Error('Order must be collected before you can rate it');
  }
  
  // 4. Check if already rated
  if (order.rating !== null && order.rating !== undefined) {
    throw new Error('You have already rated this order');
  }
  
  // 5. Validate rating
  if (ratingData.rating < 1 || ratingData.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  // 6. Update the order with rating and review
  const updatedOrder = await orderRepo.updateOrderRating(
    orderId,
    ratingData.rating,
    ratingData.review
  );
  
  return updatedOrder;
}

// Get rating for a specific order (check authorization)
export async function getOrderRating(orderId: string, customerId: string) {
  const order = await orderRepo.getOrderById(orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Check authorization
  if (order.customer_id !== customerId) {
    throw new Error('Unauthorized');
  }
  
  return {
    rating: order.rating,
    review: order.review
  };
}

// Get average rating for a vendor (for vendor dashboard)
export async function getVendorAverageRating(vendorId: string) {
  const result = orderRepo.getAverageRatingForVendor(vendorId);
  
  
  return result
  
}