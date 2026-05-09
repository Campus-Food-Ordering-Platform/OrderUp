import { createOrder, getOrdersByVendor, getOrderById, updateOrderStatus, getActiveOrderByStudent,getOrdersByStudent, getAllOrdersAdmin } from './order.repository';
import { CreateOrderDTO } from './order.model';
import { OrderStatus, STATUS_TRANSITIONS } from './order.status';
import pool from '../../config/db';
import { sendPushNotification } from '../notifications/notification.service';

export async function placeOrder(data: CreateOrderDTO) {
  return await createOrder(data);
}

// ── Push messages for each status the student cares about ───────────────────
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

export async function getVendorOrders(vendorId: string) {
  return await getOrdersByVendor(vendorId);
}

export async function getOrderStatus(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');
  return order;
}

export async function advanceOrderStatus(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  console.log('order.status from DB:', order.status);
  console.log('STATUS_TRANSITIONS keys:', Object.keys(STATUS_TRANSITIONS));

  const nextStatus = STATUS_TRANSITIONS[order.status as OrderStatus];
  if (!nextStatus) throw new Error('Order is already at final status');

  const updated = await updateOrderStatus(orderId, nextStatus);

  // Send push notification when order is ready
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

export async function getStudentActiveOrder(studentId: string) {
  return await getActiveOrderByStudent(studentId);
}
export async function getStudentHistory(studentId: string) { //this is for the order history page
  return getOrdersByStudent(studentId);
}

export async function getAllOrdersForAdmin() {
  return await getAllOrdersAdmin();
}