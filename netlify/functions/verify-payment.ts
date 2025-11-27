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
  doc.setFillColor(255, 107, 90);
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
  const qrX = 75;
  const qrY = 205;
  const qrSize = 60;
  doc.addImage(qrCodeBase64, 'PNG', qrX, qrY, qrSize, qrSize);

  // Footer
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

    // CUSTOMER EMAIL - Professional, spam-proof template
    const customerEmail = {
      to: bookingData.email,
      from: {
        email: process.env.ORGANIZER_EMAIL!,
        name: 'NextGen Brothers Events'
      },
      replyTo: process.env.ORGANIZER_EMAIL!,
      subject: 'Your Pre-Christmas Musical Night Ticket Confirmation',
      // Anti-spam headers
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Entity-Ref-ID': ticketId
      },
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Ticket is Confirmed</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5; padding:20px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#FF6B5A; padding:40px 30px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:bold; letter-spacing:-0.5px;">
                Booking Confirmed!
              </h1>
              <p style="margin:10px 0 0 0; color:#ffffff; font-size:16px; opacity:0.95;">
                Your ticket is ready
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 30px;">
              <!-- Greeting -->
              <p style="margin:0 0 20px 0; font-size:18px; color:#333333; line-height:1.5;">
                Hi <strong>${bookingData.name}</strong>,
              </p>

              <p style="margin:0 0 25px 0; font-size:16px; color:#555555; line-height:1.6;">
                Thank you for booking your ticket to the <strong>Pre-Christmas Musical Night</strong>! We're excited to have you join us for an unforgettable evening.
              </p>

              <!-- Ticket ID Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0; background:linear-gradient(135deg, #FF6B5A 0%, #FF8A7A 100%); border-radius:12px;">
                <tr>
                  <td style="padding:30px; text-align:center;">
                    <p style="margin:0 0 15px 0; color:#ffffff; font-size:16px; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">
                      Your Ticket ID
                    </p>
                    <div style="background-color:#000000; color:#ffffff; padding:15px 25px; border-radius:8px; display:inline-block; font-size:20px; font-weight:bold; letter-spacing:2px;">
                      ${ticketId}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Event Details -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:25px 0; background-color:#f9f9f9; border-left:4px solid #FF6B5A; border-radius:4px;">
                <tr>
                  <td style="padding:25px;">
                    <h3 style="margin:0 0 15px 0; color:#FF6B5A; font-size:18px; font-weight:bold;">
                      Event Details
                    </h3>
                    
                    <table width="100%" cellpadding="8" cellspacing="0" border="0">
                      <tr style="border-bottom:1px solid #e0e0e0;">
                        <td style="font-weight:bold; color:#555555; font-size:14px;">Event:</td>
                        <td style="color:#333333; font-size:14px; text-align:right;">Pre-Christmas Musical Night</td>
                      </tr>
                      <tr style="border-bottom:1px solid #e0e0e0;">
                        <td style="font-weight:bold; color:#555555; font-size:14px;">Date:</td>
                        <td style="color:#333333; font-size:14px; text-align:right;">Friday, December 20, 2025</td>
                      </tr>
                      <tr style="border-bottom:1px solid #e0e0e0;">
                        <td style="font-weight:bold; color:#555555; font-size:14px;">Time:</td>
                        <td style="color:#333333; font-size:14px; text-align:right;">6:00 PM - 10:00 PM</td>
                      </tr>
                      <tr style="border-bottom:1px solid #e0e0e0;">
                        <td style="font-weight:bold; color:#555555; font-size:14px;">Venue:</td>
                        <td style="color:#333333; font-size:14px; text-align:right;">Habrubari, Kokrajhar, Assam</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold; color:#555555; font-size:14px;">Amount Paid:</td>
                        <td style="color:#10B981; font-size:16px; font-weight:bold; text-align:right;">₹200</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Important Instructions -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:25px 0; background-color:#FFF9E6; border:2px solid #FFD700; border-radius:8px;">
                <tr>
                  <td style="padding:20px;">
                    <h4 style="margin:0 0 12px 0; color:#D97706; font-size:16px; font-weight:bold;">
                      Important Instructions
                    </h4>
                    <ul style="margin:0; padding-left:20px; color:#666666; font-size:14px; line-height:1.8;">
                      <li style="margin-bottom:8px;"><strong>Bring this ticket</strong> (printed or on your phone)</li>
                      <li style="margin-bottom:8px;"><strong>Carry a valid ID</strong> for verification</li>
                      <li style="margin-bottom:8px;"><strong>Entry via QR code scan</strong> - keep it ready</li>
                      <li style="margin-bottom:8px;"><strong>Gates open at 5:30 PM</strong> - arrive early</li>
                      <li style="margin-bottom:0;"><strong>Non-refundable</strong> and non-transferable</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin:25px 0 0 0; font-size:14px; color:#666666; line-height:1.6; text-align:center;">
                Your ticket is attached to this email as a PDF.<br>
                Please save it and bring it to the event.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://www.instagram.com/nextgen.brothers" style="display:inline-block; background-color:#000000; color:#ffffff; padding:15px 40px; text-decoration:none; border-radius:6px; font-weight:bold; font-size:14px;">
                      Follow Us on Instagram
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:30px 0 0 0; font-size:15px; color:#666666; text-align:center; line-height:1.6;">
                See you at the event! Get ready for an amazing night! 🎵
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f5f5f5; padding:30px; text-align:center;">
              <p style="margin:0 0 10px 0; font-size:14px; color:#666666;">
                <a href="https://www.instagram.com/nextgen.brothers" style="color:#FF6B5A; text-decoration:none; margin:0 10px;">Instagram</a> •
                <a href="mailto:hype0115@gmail.com" style="color:#FF6B5A; text-decoration:none; margin:0 10px;">Email</a> •
                <a href="tel:6901649023" style="color:#FF6B5A; text-decoration:none; margin:0 10px;">Call Us</a>
              </p>
              <p style="margin:15px 0 5px 0; font-size:14px; color:#666666; font-weight:bold;">
                NextGen Brothers
              </p>
              <p style="margin:5px 0; font-size:13px; color:#777777; line-height:1.6;">
                Habrubari, Kokrajhar, Assam 783370<br>
                hype0115@gmail.com | 6901649023
              </p>
              <p style="margin:20px 0 0 0; font-size:12px; color:#999999; line-height:1.5;">
                This is an automated confirmation email.<br>
                For support, contact us at hype0115@gmail.com
              </p>
              <p style="margin:15px 0 0 0; font-size:11px; color:#aaaaaa;">
                Add hype0115@gmail.com to your contacts to ensure delivery.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `
Hi ${bookingData.name},

Your booking for Pre-Christmas Musical Night is confirmed!

TICKET ID: ${ticketId}

EVENT DETAILS:
- Date: Friday, December 20, 2025
- Time: 6:00 PM - 10:00 PM
- Venue: Habrubari, Kokrajhar, Assam 783370
- Amount Paid: ₹200

IMPORTANT:
- Bring this ticket (printed or on phone)
- Carry a valid ID
- Gates open at 5:30 PM
- Entry via QR code scan

Your ticket is attached as a PDF.

See you at the event!

NextGen Brothers
hype0115@gmail.com | 6901649023
      `,
      attachments: [
        {
          content: ticketPDF.toString('base64'),
          filename: `NextGen-Ticket-${ticketId}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ],
      categories: ['ticket', 'confirmation', 'event'],
      customArgs: {
        event: 'pre-christmas-2025',
        ticket_id: ticketId,
        booking_id: bookingId
      },
      trackingSettings: {
        clickTracking: {
          enable: false
        },
        openTracking: {
          enable: true
        }
      }
    };

    // ORGANIZER EMAIL - Clean notification
    const organizerEmail = {
      to: process.env.ORGANIZER_EMAIL!,
      from: {
        email: process.env.ORGANIZER_EMAIL!,
        name: 'NextGen Booking System'
      },
      subject: `New Booking: ${bookingData.name} - ${ticketId}`,
      headers: {
        'X-Priority': '1',
        'Importance': 'high'
      },
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking</title>
</head>
<body style="margin:0; padding:20px; background-color:#f5f5f5; font-family:Arial,sans-serif;">
  <table width="700" cellpadding="0" cellspacing="0" border="0" style="max-width:700px; margin:0 auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
    
    <tr>
      <td style="background-color:#000000; color:#ffffff; padding:25px 30px; text-align:center;">
        <h2 style="margin:0; font-size:24px;">New Ticket Booking</h2>
        <p style="margin:5px 0 0 0; opacity:0.9;">Pre-Christmas Musical Night</p>
      </td>
    </tr>

    <tr>
      <td style="padding:30px;">
        <p style="margin:0 0 20px 0;">
          <span style="display:inline-block; padding:6px 12px; background-color:#10B981; color:white; border-radius:4px; font-size:12px; font-weight:bold;">
            ✓ CONFIRMED
          </span>
        </p>
        
        <h3 style="margin:25px 0 15px 0; color:#333;">Booking Details</h3>
        
        <table width="100%" cellpadding="12" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr style="background-color:#f8f8f8; border-bottom:2px solid #ddd;">
            <th style="text-align:left; font-weight:bold; width:40%;">Field</th>
            <th style="text-align:left; font-weight:bold;">Value</th>
          </tr>
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;">Ticket ID</td>
            <td>${ticketId}</td>
          </tr>
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;">Name</td>
            <td>${bookingData.name}</td>
          </tr>
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;">Email</td>
            <td><a href="mailto:${bookingData.email}" style="color:#FF6B5A;">${bookingData.email}</a></td>
          </tr>
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;">Phone</td>
            <td><a href="tel:${bookingData.phone}" style="color:#FF6B5A;">${bookingData.phone}</a></td>
          </tr>
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;">Amount</td>
            <td style="color:#10B981; font-weight:bold;">₹${bookingData.amount}</td>
          </tr>
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;">Payment ID</td>
            <td><code style="background:#f0f0f0; padding:4px 8px; border-radius:3px; font-size:12px;">${razorpay_payment_id}</code></td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Booking Time</td>
            <td>${new Date().toLocaleString('en-IN', { 
              timeZone: 'Asia/Kolkata',
              dateStyle: 'full',
              timeStyle: 'short'
            })}</td>
          </tr>
        </table>

        <p style="margin:30px 0 0 0; padding:15px; background-color:#f0f9ff; border-left:4px solid #0284c7; border-radius:4px; font-size:14px; color:#333;">
          <strong>Note:</strong> Customer has been sent their ticket via email with QR code.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
      `,
      text: `
NEW BOOKING CONFIRMED

Ticket ID: ${ticketId}
Name: ${bookingData.name}
Email: ${bookingData.email}
Phone: ${bookingData.phone}
Amount: ₹${bookingData.amount}
Payment ID: ${razorpay_payment_id}
Booking Time: ${new Date().toLocaleString('en-IN')}

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

    // Send emails with error handling
    try {
      await Promise.all([
        sgMail.send(customerEmail),
        sgMail.send(organizerEmail)
      ]);
      console.log('Emails sent successfully to:', bookingData.email, process.env.ORGANIZER_EMAIL);
    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
      if (emailError.response) {
        console.error('SendGrid error details:', emailError.response.body);
      }
      // Don't throw - booking is confirmed, email failure is non-critical
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
