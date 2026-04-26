import { createOrder, getOrdersByVendor, getOrderById, updateOrderStatus, getActiveOrderByStudent } from './order.repository';
import { CreateOrderDTO } from './order.model';
import { OrderStatus, STATUS_TRANSITIONS } from './order.status';

export async function placeOrder(data: CreateOrderDTO) {
  return await createOrder(data);
}

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

  return await updateOrderStatus(orderId, nextStatus);
}

export async function getStudentActiveOrder(studentId: string) {
  return await getActiveOrderByStudent(studentId);
}