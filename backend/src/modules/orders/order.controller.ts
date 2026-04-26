import { Request, Response } from 'express';
import { placeOrder, getVendorOrders, getOrderStatus, advanceOrderStatus, getStudentActiveOrder } from './order.service';

export async function createOrderHandler(req: Request, res: Response) {
  try {
    const order = await placeOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
}

export async function getVendorOrdersHandler(req: Request, res: Response) {
  try {
    const vendorId = req.params.vendorId as string;
    if (!vendorId) return res.status(400).json({ error: 'Invalid vendor ID' });
    const orders = await getVendorOrders(vendorId);
    res.json(orders);
  } catch (err) {
    console.error('getVendorOrders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export async function getOrderStatusHandler(req: Request, res: Response) {
  try {
    const orderId = req.params.orderId as string;
    if (!orderId) return res.status(400).json({ error: 'Invalid order ID' });
    const order = await getOrderStatus(orderId);
    res.json({ status: order.status });
  } catch (err: any) {
    const status = err.message === 'Order not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function advanceOrderStatusHandler(req: Request, res: Response) {
  try {
    const orderId = req.params.orderId as string;
    if (!orderId) return res.status(400).json({ error: 'Invalid order ID' });
    const order = await advanceOrderStatus(orderId);
    res.json(order);
  } catch (err: any) {
    const status = err.message === 'Order not found' ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
}

// GET /api/orders/student/:studentId/active
// Called by student dashboard to show active order
export async function getStudentActiveOrderHandler(req: Request, res: Response) {
  try {
    const studentId = req.params.studentId as string;
    if (!studentId) return res.status(400).json({ error: 'Invalid student ID' });

    const order = await getStudentActiveOrder(studentId);
    if (!order) return res.status(404).json({ error: 'No active order' });

    res.json(order);
  } catch (err) {
    console.error('getStudentActiveOrder error:', err);
    res.status(500).json({ error: 'Failed to fetch active order' });
  }
}