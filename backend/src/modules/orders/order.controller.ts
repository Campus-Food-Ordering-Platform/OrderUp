import { Request, Response } from 'express';

import * as orderService  from './order.service';


export async function createOrderHandler(req: Request, res: Response) {
  try {
    const order = await orderService.placeOrder(req.body);
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
    const orders = await orderService.getVendorOrders(vendorId);
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
    const order = await orderService.getOrderStatus(orderId);
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
    const order = await orderService.advanceOrderStatus(orderId);
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

    const order = await orderService.getStudentActiveOrder(studentId);
    if (!order) return res.status(404).json({ error: 'No active order' });

    res.json(order);
  } catch (err) {
    console.error('getStudentActiveOrder error:', err);
    res.status(500).json({ error: 'Failed to fetch active order' });
  }
}
export async function getStudentHistoryHandler(req: Request, res: Response) {
  try {
    const studentId = req.params.studentId as string;
    if (!studentId) return res.status(400).json({ error: 'Invalid student ID' });
    const orders = await orderService.getStudentHistory(studentId);
    res.json(orders);
  } catch (err) {
    console.error('getStudentHistory error:', err);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
}
export async function getStudentActiveOrdersHandler(req: Request, res: Response) {
  try {
    const studentId = req.params.studentId as string;
    if (!studentId) return res.status(400).json({ error: 'Invalid student ID' });
    const orders = await orderService.getAllActiveOrdersByStudent(studentId);
    res.json(orders);
  } catch (err) {
    console.error('getStudentActiveOrders error:', err);
    res.status(500).json({ error: 'Failed to fetch active orders' });
  }
}

export async function getAllOrdersAdminHandler(req: Request, res: Response) {
  try {
    const orders = await orderService.getAllOrdersForAdmin();
    res.json(orders);
  } catch (err) {
    console.error('getAllOrdersAdmin error:', err);
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
}

// ===============RATING================================
export async function rateOrderHandler(req: Request, res: Response) {
  try {
    const orderId = req.params.orderId as string;
    const { rating, review, studentId } = req.body;

    if (!studentId) return res.status(401).json({ error: 'Authentication required' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    const updatedOrder = await orderService.rateOrder(orderId, studentId, { rating, review });
    res.status(200).json({ success: true, data: { rating: updatedOrder.rating, review: updatedOrder.review } });

  } catch (err: any) {
    if (err.message === 'Order not found') return res.status(404).json({ error: err.message });
    if (err.message.includes('Unauthorized')) return res.status(403).json({ error: err.message });
    if (err.message.includes('already rated')) return res.status(400).json({ error: err.message });
    if (err.message.includes('collected')) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Failed to submit rating' });
  }
}

export async function getOrderRatingHandler(req: Request, res: Response) {
  try {
    const orderId = req.params.orderId as string;
    const studentId = (req as any).auth?.payload?.sub as string;

    if (!studentId) return res.status(401).json({ error: 'Authentication required' });

    const rating = await orderService.getOrderRating(orderId, studentId);
    res.status(200).json(rating);

  } catch (err: any) {
    if (err.message === 'Order not found') return res.status(404).json({ error: err.message });
    if (err.message.includes('Unauthorized')) return res.status(403).json({ error: err.message });
    res.status(500).json({ error: 'Failed to fetch rating' });
  }
}

export async function getVendorRatingsHandler(req: Request, res: Response) {
  try {
    const vendorId = req.params.vendorId as string;
    if (!vendorId) return res.status(400).json({ error: 'Invalid vendor ID' });

    const ratings = await orderService.getVendorAverageRating(vendorId);
    res.status(200).json(ratings);

  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch vendor ratings' });
  }
}