import type { Handler } from '@netlify/functions';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID!, // Fixed: removed VITE_ prefix
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

// Helper function to validate email
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper function to validate phone
const isValidPhone = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone);
};

// Retry logic for rate limiting
const createOrderWithRetry = async (options: any, retries = 3): Promise<any> => {
  try {
    return await razorpay.orders.create(options);
  } catch (error: any) {
    if (error.statusCode === 429 && retries > 0) {
      const delay = 1000 * (4 - retries); // Exponential backoff: 1s, 2s, 3s
      await new Promise(resolve => setTimeout(resolve, delay));
      return createOrderWithRetry(options, retries - 1);
    }
    throw error;
  }
};

export const handler: Handler = async (event) => {
  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*', // Update with your domain in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse and validate request body
    const body = event.body;
    if (!body || body.length > 10000) { // Limit request size
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request body' })
      };
    }

    const { amount, bookingId, name, email, phone } = JSON.parse(body);

    // Validate required fields
    if (!amount || !bookingId || !name || !email || !phone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['amount', 'bookingId', 'name', 'email', 'phone']
        })
      };
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0 || amount > 50000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid amount. Must be between 1 and 50000 INR' 
        })
      };
    }

    // Validate email
    if (!isValidEmail(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Validate phone
    if (!isValidPhone(phone)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid phone number. Must be 10-digit Indian mobile number' 
        })
      };
    }

    // Validate bookingId format
    if (typeof bookingId !== 'string' || bookingId.length < 5 || bookingId.length > 50) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid booking ID format' })
      };
    }

    // Create Razorpay order options
    const options = {
      amount: Math.round(amount * 100), // Convert to paise, ensure integer
      currency: 'INR',
      receipt: bookingId.substring(0, 40), // Razorpay receipt limit is 40 chars
      notes: {
        bookingId,
        name: name.substring(0, 100),
        email: email.substring(0, 100),
        phone: phone.substring(0, 15)
      }
    };

    // Create order with retry logic
    const order = await createOrderWithRetry(options);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        order
      })
    };

  } catch (error: any) {
    console.error('Create order error:', {
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString()
    });

    // Handle specific Razorpay errors
    if (error.statusCode === 429) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          error: 'Service temporarily busy. Please try again in a few seconds.' 
        })
      };
    }

    if (error.statusCode === 401) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Payment service configuration error' })
      };
    }

    // Generic error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create order. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
