import type { Handler } from '@netlify/functions';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import sgMail from '@sendgrid/mail';
import admin from 'firebase-admin';
import { generateTicketPDF, generateTicketImage, generateTicketId } from './utils/generateTicket';

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

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = JSON.parse(event.body || '{}');

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid signature');
    }

    // Fetch booking data first to verify amount
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();
    const bookingData = bookingDoc.data();

    if (!bookingData) {
      throw new Error('Booking not found');
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // 🔒 CRITICAL SECURITY: Verify payment amount matches booking
    if (payment.amount !== bookingData.amount * 100) {
      throw new Error('Payment amount mismatch');
    }

    // Verify payment currency
    if (payment.currency !== 'INR') {
      throw new Error('Invalid currency');
    }

    // Verify payment status
    if (payment.status !== 'captured') {
      throw new Error('Payment not captured');
    }

    // Generate unique ticket ID (NGB### format)
    const ticketId = generateTicketId();

    // Update booking in Firestore with check-in fields
    await bookingRef.update({
      status: 'confirmed',
      ticketId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      confirmedAt: new Date().toISOString(),
      // Initialize check-in fields
      checkedIn: false,
      checkedInAt: null,
      checkedInBy: null,
      checkInAttempts: []
    });

    // Generate ticket with template + QR code
    const ticketData = {
      name: bookingData.name,
      ticketId
    };

    console.log('Generating tickets for:', ticketData);

    const [ticketPDF, ticketPNG] = await Promise.all([
      generateTicketPDF(ticketData),
      generateTicketImage(ticketData)
    ]);

    console.log('Tickets generated successfully');

    // CUSTOMER EMAIL
    const customerEmail = {
      to: bookingData.email,
      from: {
        email: process.env.ORGANIZER_EMAIL!,
        name: 'NextGen Brothers'
      },
      replyTo: process.env.ORGANIZER_EMAIL!,
      subject: 'Ticket Confirmed - Pre-Christmas Musical Night - Dec 20',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <p>Hi ${bookingData.name},</p>

  <p>Your ticket for Pre-Christmas Musical Night has been confirmed.</p>

  <p><strong>Ticket ID: ${ticketId}</strong></p>

  <p><strong>Event Details:</strong></p>
  <p>
    Event: Pre-Christmas Musical Night<br>
    Date: Friday, December 20, 2025<br>
    Time: 6:00 PM - 10:00 PM<br>
    Venue: Golden Jubilee Road, New Flyover, Near Goyary Car Wash<br>
    Amount Paid: Rs ${bookingData.amount}
  </p>

  <p><strong>Important - Please Read:</strong></p>
  <p>
    1. Your ticket is attached to this email as a PDF file<br>
    2. Please bring the ticket (printed or on your phone) to the event<br>
    3. Carry a valid government-issued ID for verification<br>
    4. Entry is via QR code scanning at Gate 1<br>
    5. Gates open at 5:30 PM<br>
    6. This ticket is non-refundable and non-transferable
  </p>

  <div style="background-color: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0;">
    <p style="margin: 0; color: #856404; font-weight: bold;">⚠️ Not seeing this email?</p>
    <p style="margin: 8px 0 0 0; color: #856404;">
      Please check your <strong>Spam</strong> or <strong>Promotions</strong> folder. Sometimes our emails may end up there by mistake. 
      Add hype0115@gmail.com to your contacts to prevent this in the future.
    </p>
  </div>

  <h3 style="margin-top: 30px;">Ticket Preview:</h3>
  <img src="cid:ticket_image" alt="Your Ticket" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px;">

  <p style="margin-top: 30px;">If you have any questions, please contact us at:</p>
  <p>
    Email: hype0115@gmail.com<br>
    Phone: 6901649023<br>
    Instagram: @nextgen.brothers
  </p>

  <p>See you at the event!</p>

  <p>
    Best regards,<br>
    NextGen Brothers Team<br>
    Habrubari, Kokrajhar, Assam 783370
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

  <p style="font-size: 12px; color: #666;">
    This is an automated confirmation email for your ticket purchase. 
    Please add hype0115@gmail.com to your email contacts to ensure you receive future updates.
  </p>

</body>
</html>
      `,
      text: `Hi ${bookingData.name},

Your ticket for Pre-Christmas Musical Night has been confirmed.

Ticket ID: ${ticketId}

EVENT DETAILS:
Event: Pre-Christmas Musical Night
Date: Friday, December 20, 2025
Time: 6:00 PM - 10:00 PM
Venue: Golden Jubilee Road, New Flyover, Near Goyary Car Wash
Amount Paid: Rs ${bookingData.amount}

IMPORTANT - PLEASE READ:
1. Your ticket is attached to this email as a PDF file
2. Please bring the ticket (printed or on your phone) to the event
3. Carry a valid government-issued ID for verification
4. Entry is via QR code scanning at Gate 1
5. Gates open at 5:30 PM
6. This ticket is non-refundable and non-transferable

⚠️ NOT SEEING THIS EMAIL?
If you don't see this email in your inbox, please check your Spam or Promotions folder. 
Sometimes our emails may be filtered there by mistake. 
Add hype0115@gmail.com to your contacts to prevent this in the future.

If you have any questions, please contact us at:
Email: hype0115@gmail.com
Phone: 6901649023
Instagram: @nextgen.brothers

See you at the event!

Best regards,
NextGen Brothers Team
Habrubari, Kokrajhar, Assam 783370

---
This is an automated confirmation email for your ticket purchase.
Please add hype0115@gmail.com to your email contacts to ensure you receive future updates.
      `,
      attachments: [
        {
          content: ticketPDF.toString('base64'),
          filename: `Ticket-${ticketId}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        },
        {
          content: ticketPNG.toString('base64'),
          filename: `Ticket-${ticketId}.png`,
          type: 'image/png',
          disposition: 'inline',
          content_id: 'ticket_image'
        }
      ],
      mailSettings: {
        sandboxMode: {
          enable: false
        }
      }
    };

    // Send email
    try {
      await sgMail.send(customerEmail);
      console.log('✓ Email sent successfully');
    } catch (emailError: any) {
      console.error('✗ Email sending failed:', emailError);
      if (emailError.response) {
        console.error('SendGrid error:', JSON.stringify(emailError.response.body));
      }
      // Don't throw - booking confirmed, email is secondary
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        ticketId,
        message: 'Payment verified and ticket sent'
      })
    };
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Payment verification failed'
      })
    };
  }
};
