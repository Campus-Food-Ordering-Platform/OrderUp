import { createOrder, getOrdersByVendor, getOrderById, updateOrderStatus, getActiveOrderByStudent, getOrdersByStudent, getAllOrdersAdmin } from './order.repository';
import { CreateOrderDTO } from './order.model';
import { OrderStatus, STATUS_TRANSITIONS } from './order.status';
import pool from '../../config/db';
import { sendPushNotification } from '../notifications/notification.service';

// Place a new order (Auth0 ID resolution happens inside createOrder)
export async function placeOrder(data: CreateOrderDTO) {
  return await createOrder(data);
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
  return await getOrdersByVendor(vendorId);
}

// Fetch a single order's status (used by student for polling)
export async function getOrderStatus(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');
  return order;
}

// Advance an order to the next status and send a push notification if ready
export async function advanceOrderStatus(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  console.log('order.status from DB:', order.status);
  console.log('STATUS_TRANSITIONS keys:', Object.keys(STATUS_TRANSITIONS));

  const nextStatus = STATUS_TRANSITIONS[order.status as OrderStatus];
  if (!nextStatus) throw new Error('Order is already at final status');

  const updated = await updateOrderStatus(orderId, nextStatus);

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
  return await getActiveOrderByStudent(studentId);
}

// Get full order history for a student (Auth0 ID passed in, resolved in repository)
export async function getStudentHistory(studentId: string) {
  return getOrdersByStudent(studentId);
}

// Fetch all orders for the admin view
export async function getAllOrdersForAdmin() {
  return await getAllOrdersAdmin();
}