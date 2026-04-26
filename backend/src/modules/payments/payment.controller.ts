import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import pool from '../../config/db';

export const paymentController = {

  // POST /api/payments/initialize
  async initializePayment(req: Request, res: Response) {
    try {
      const { email, amount, orderId } = req.body;

      if (!email || !amount || !orderId) {
        return res.status(400).json({ message: 'Email, amount and orderId are required' });
      }

      const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-confirmed`;

      const payment = await paymentService.initializePayment({
        email,
        amount,
        orderId,
        callbackUrl
      });

      return res.status(200).json({
        paymentUrl: payment.authorization_url,
        reference: payment.reference
      });

    } catch (error) {
      console.error('Payment initialization error:', error);
      return res.status(500).json({ message: 'Error initializing payment' });
    }
  },

  // GET /api/payments/verify/:reference
  async verifyPayment(req: Request, res: Response) {
    try {
      const reference = req.params['reference'] as string;
      const payment = await paymentService.verifyPayment(reference);

     if (payment.status === 'success') {
  // Update the order status to received
     await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2',
      ['received', payment.metadata.orderId]
    );

    return res.status(200).json({
        success: true,
        orderId: payment.metadata.orderId,
        message: 'Payment successful'
      });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Payment failed or pending'
        });
      }

    } catch (error) {
      console.error('Payment verification error:', error);
      return res.status(500).json({ message: 'Error verifying payment' });
    }
  }
};