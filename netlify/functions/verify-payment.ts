import type { Handler } from '@netlify/functions';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import sgMail from '@sendgrid/mail';
import admin from 'firebase-admin';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

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

// Generate QR Code as base64
async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
}

// Generate ticket PDF
async function generateTicketPDF(bookingData: any, qrCodeBase64: string): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFillColor(255, 107, 90);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 15, 180, 267, 5, 5, 'F');

  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('NEXTGEN BROTHERS', 105, 40, { align: 'center' });

  doc.setFontSize(24);
  doc.text('PRE-CHRISTMAS', 105, 55, { align: 'center' });
  doc.text('MUSICAL NIGHT', 105, 68, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(30, 80, 180, 80);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EVENT DETAILS', 30, 95);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Date: December 20, 2025', 30, 105);
  doc.text('Time: 6:00 PM - 10:00 PM', 30, 113);
  doc.text('Venue: Habrubari, Kokrajhar, Assam 783370', 30, 121);

  doc.line(30, 130, 180, 130);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TICKET HOLDER', 30, 143);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Name: ${bookingData.name}`, 30, 153);
  doc.text(`Email: ${bookingData.email}`, 30, 161);
  doc.text(`Phone: ${bookingData.phone}`, 30, 169);
  doc.text(`Ticket ID: ${bookingData.ticketId}`, 30, 177);

  doc.line(30, 186, 180, 186);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SCAN TO VERIFY', 105, 198, { align: 'center' });

  const qrX = 75;
  const qrY = 205;
  const qrSize = 60;
  doc.addImage(qrCodeBase64, 'PNG', qrX, qrY, qrSize, qrSize);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text('Please carry this ticket and a valid ID to the event', 105, 275, { align: 'center' });
  doc.text('For support: hype0115@gmail.com | 6901649023', 105, 282, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}

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

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      throw new Error('Payment not captured');
    }

    // Generate unique ticket ID
    const ticketId = `NGB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Update booking in Firestore
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();
    const bookingData = bookingDoc.data();

    if (!bookingData) {
      throw new Error('Booking not found');
    }

    await bookingRef.update({
      status: 'confirmed',
      ticketId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      confirmedAt: new Date().toISOString()
    });

    const updatedBookingData = {
      ...bookingData,
      ticketId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    };

    // Generate QR code
    const qrData = JSON.stringify({
      ticketId,
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      eventDate: bookingData.eventDate,
      bookingId
    });

    const qrCodeBase64 = await generateQRCode(qrData);
    const ticketPDF = await generateTicketPDF(updatedBookingData, qrCodeBase64);

    // SIMPLIFIED CUSTOMER EMAIL - Plain text style, minimal HTML
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
    Venue: Habrubari, Kokrajhar, Assam 783370<br>
    Amount Paid: Rs 200
  </p>

  <p><strong>Important - Please Read:</strong></p>
  <p>
    1. Your ticket is attached to this email as a PDF file<br>
    2. Please bring the ticket (printed or on your phone) to the event<br>
    3. Carry a valid government-issued ID for verification<br>
    4. Entry is via QR code scanning<br>
    5. Gates open at 5:30 PM<br>
    6. This ticket is non-refundable and non-transferable
  </p>

  <p>If you have any questions, please contact us at:</p>
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
Venue: Habrubari, Kokrajhar, Assam 783370
Amount Paid: Rs 200

IMPORTANT - PLEASE READ:
1. Your ticket is attached to this email as a PDF file
2. Please bring the ticket (printed or on your phone) to the event
3. Carry a valid government-issued ID for verification
4. Entry is via QR code scanning
5. Gates open at 5:30 PM
6. This ticket is non-refundable and non-transferable

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
        }
      ],
      mailSettings: {
        sandboxMode: {
          enable: false
        }
      }
    };

    // ORGANIZER EMAIL - Simple notification
    const organizerEmail = {
      to: process.env.ORGANIZER_EMAIL!,
      from: {
        email: process.env.ORGANIZER_EMAIL!,
        name: 'Booking System'
      },
      subject: `New Booking - ${bookingData.name} - ${ticketId}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <h2>New Ticket Booking Confirmed</h2>

  <p><strong>Ticket ID:</strong> ${ticketId}</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px; font-weight: bold;">Name:</td>
      <td style="padding: 8px;">${bookingData.name}</td>
    </tr>
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px; font-weight: bold;">Email:</td>
      <td style="padding: 8px;">${bookingData.email}</td>
    </tr>
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px; font-weight: bold;">Phone:</td>
      <td style="padding: 8px;">${bookingData.phone}</td>
    </tr>
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px; font-weight: bold;">Amount:</td>
      <td style="padding: 8px;">Rs ${bookingData.amount}</td>
    </tr>
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px; font-weight: bold;">Payment ID:</td>
      <td style="padding: 8px;">${razorpay_payment_id}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold;">Booking Time:</td>
      <td style="padding: 8px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
    </tr>
  </table>

  <p>Customer has been sent their ticket via email with QR code.</p>

</body>
</html>
      `,
      text: `NEW BOOKING CONFIRMED

Ticket ID: ${ticketId}

Name: ${bookingData.name}
Email: ${bookingData.email}
Phone: ${bookingData.phone}
Amount: Rs ${bookingData.amount}
Payment ID: ${razorpay_payment_id}
Booking Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Customer has been sent their ticket via email.
      `,
      attachments: [
        {
          content: ticketPDF.toString('base64'),
          filename: `Organizer-${ticketId}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    // Send emails
    try {
      await Promise.all([
        sgMail.send(customerEmail),
        sgMail.send(organizerEmail)
      ]);
      console.log('✓ Emails sent successfully');
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
