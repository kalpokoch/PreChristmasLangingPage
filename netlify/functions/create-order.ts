import type { Handler } from '@netlify/functions';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { amount, bookingId, name, email, phone } = JSON.parse(event.body || '{}');

    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: bookingId,
      notes: {
        bookingId,
        name,
        email,
        phone
      }
    };

    const order = await razorpay.orders.create(options);

    return {
      statusCode: 200,
      body: JSON.stringify(order)
    };
  } catch (error: any) {
    console.error('Create order error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to create order' })
    };
  }
};
