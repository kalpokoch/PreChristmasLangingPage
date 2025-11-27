import type { Handler } from '@netlify/functions';
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { bookingId } = JSON.parse(event.body || '{}');

    if (!bookingId) {
      throw new Error('Booking ID required');
    }

    // Delete the pending booking
    await db.collection('bookings').doc(bookingId).delete();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Booking cancelled'
      })
    };
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to cancel booking'
      })
    };
  }
};
