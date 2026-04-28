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
        callbackUrl,
        cancelUrl: `${process.env.FRONTEND_URL}/checkout`
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
      // Don't update any order here — the frontend will create
      // the order AFTER this verify call succeeds.
      // Just confirm payment was successful.
      return res.status(200).json({
        success: true,
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
}};