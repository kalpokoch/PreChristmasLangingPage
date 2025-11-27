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

  // Background
  doc.setFillColor(255, 107, 90); // Coral color
  doc.rect(0, 0, 210, 297, 'F');

  // White content area
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 15, 180, 267, 5, 5, 'F');

  // Title
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('NEXTGEN BROTHERS', 105, 40, { align: 'center' });

  doc.setFontSize(24);
  doc.text('PRE-CHRISTMAS', 105, 55, { align: 'center' });
  doc.text('MUSICAL NIGHT', 105, 68, { align: 'center' });

  // Divider
  doc.setLineWidth(0.5);
  doc.line(30, 80, 180, 80);

  // Event Details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EVENT DETAILS', 30, 95);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Date: December 20, 2025', 30, 105);
  doc.text('Time: 6:00 PM - 10:00 PM', 30, 113);
  doc.text('Venue: Habrubari, Kokrajhar, Assam 783370', 30, 121);

  // Divider
  doc.line(30, 130, 180, 130);

  // Ticket Holder Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TICKET HOLDER', 30, 143);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Name: ${bookingData.name}`, 30, 153);
  doc.text(`Email: ${bookingData.email}`, 30, 161);
  doc.text(`Phone: ${bookingData.phone}`, 30, 169);
  doc.text(`Ticket ID: ${bookingData.ticketId}`, 30, 177);

  // Divider
  doc.line(30, 186, 180, 186);

  // QR Code
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SCAN TO VERIFY', 105, 198, { align: 'center' });

  // Add QR code image
  const qrX = 75; // Center horizontally
  const qrY = 205;
  const qrSize = 60;
  doc.addImage(qrCodeBase64, 'PNG', qrX, qrY, qrSize, qrSize);

  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text('Please carry this ticket and a valid ID to the event', 105, 275, { align: 'center' });
  doc.text('For support: hypeorg2024@gmail.com | 6901649023', 105, 282, { align: 'center' });

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

    // Generate QR code with booking details
    const qrData = JSON.stringify({
      ticketId,
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      eventDate: bookingData.eventDate,
      bookingId
    });

    const qrCodeBase64 = await generateQRCode(qrData);

    // Generate ticket PDF
    const ticketPDF = await generateTicketPDF(updatedBookingData, qrCodeBase64);

    // Send email to customer
    const customerEmail = {
      to: bookingData.email,
      from: process.env.ORGANIZER_EMAIL!,
      subject: '🎉 Your Pre-Christmas Musical Night Ticket',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF6B5A; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎄 Booking Confirmed!</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Hi ${bookingData.name}! 👋</h2>
            <p style="color: #666; font-size: 16px;">
              Your ticket for the <strong>Pre-Christmas Musical Night</strong> is confirmed!
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #FF6B5A; margin-top: 0;">Event Details</h3>
              <p style="margin: 5px 0;"><strong>Date:</strong> December 20, 2025</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> 6:00 PM - 10:00 PM</p>
              <p style="margin: 5px 0;"><strong>Venue:</strong> Habrubari, Kokrajhar, Assam 783370</p>
              <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticketId}</p>
            </div>

            <p style="color: #666;">
              Your ticket is attached to this email as a PDF. Please bring a printed or digital copy
              along with a valid ID to the event.
            </p>

            <p style="color: #666;">
              See you at the event! 🎵
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
              <p style="color: #999; font-size: 12px;">
                For support, contact us at hypeorg2024@gmail.com or call 6901649023
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          content: ticketPDF.toString('base64'),
          filename: `ticket-${ticketId}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    // Send email to organizer
    const organizerEmail = {
      to: process.env.ORGANIZER_EMAIL!,
      from: process.env.ORGANIZER_EMAIL!,
      subject: `🎫 New Booking: ${bookingData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #000; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">New Ticket Booking</h2>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h3 style="color: #333;">Booking Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Ticket ID:</td>
                <td style="padding: 10px;">${ticketId}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Name:</td>
                <td style="padding: 10px;">${bookingData.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Email:</td>
                <td style="padding: 10px;">${bookingData.email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Phone:</td>
                <td style="padding: 10px;">${bookingData.phone}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Payment ID:</td>
                <td style="padding: 10px;">${razorpay_payment_id}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">Amount:</td>
                <td style="padding: 10px;">₹${bookingData.amount}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Booking Time:</td>
                <td style="padding: 10px;">${new Date().toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
        </div>
      `,
      attachments: [
        {
          content: ticketPDF.toString('base64'),
          filename: `ticket-${ticketId}.pdf`,
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
    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
      // Don't throw error - booking is confirmed, just email failed
      // Data is already saved in Firestore
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
    console.error('Verify payment error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Payment verification failed'
      })
    };
  }
};
