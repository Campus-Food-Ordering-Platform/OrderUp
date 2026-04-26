import axios from 'axios';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export const paymentService = {

  // Initialize a payment
  async initializePayment(data: {
    email: string;
    amount: number; // in kobo/cents (multiply by 100)
    orderId: string;
    callbackUrl: string;
      cancelUrl: string;
  }) {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: data.email,
        amount: data.amount * 100, // Paystack uses kobo (cents)
        reference: `order_${data.orderId}_${Date.now()}`,
        callback_url: data.callbackUrl,
         cancel_action: data.cancelUrl,
        metadata: {
          orderId: data.orderId
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.data;
  },

  // Verify a payment
  async verifyPayment(reference: string) {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`
        }
      }
    );
    return response.data.data;
  }
};