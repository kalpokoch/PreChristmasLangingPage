import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';

interface TicketData {
  name: string;
  ticketId: string;
}

// Your GitHub raw URL
const TICKET_TEMPLATE_URL = 'https://raw.githubusercontent.com/kalpokoch/PreChristmasLangingPage/main/assets/TicketDesign.png';

/**
 * Draw a rounded rectangle path
 */
function roundRect(
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export async function generateTicketPDF(data: TicketData): Promise<Buffer> {
  try {
    console.log('Starting PDF generation for:', data);
    
    // Load template from GitHub URL
    const template = await loadImage(TICKET_TEMPLATE_URL);
    console.log('Template loaded from GitHub');
    
    const canvas = createCanvas(1080, 1350);
    const ctx = canvas.getContext('2d');
    
    // Draw background template
    ctx.drawImage(template, 0, 0, 1080, 1350);
    
    // Generate QR code
    const qrData = JSON.stringify({
      ticketId: data.ticketId,
      name: data.name
    });
    
    console.log('QR Data:', qrData);
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      width: 440,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    const qrImage = await loadImage(qrCodeDataUrl);
    
    // QR code position
    const qrX = 100;
    const qrY = 800;
    const qrWidth = 440;
    const qrHeight = 440;
    const cornerRadius = 30; // Adjust this value for more/less rounding
    
    // Save canvas state
    ctx.save();
    
    // Create clipping path with rounded corners
    roundRect(ctx, qrX, qrY, qrWidth, qrHeight, cornerRadius);
    ctx.clip();
    
    // Draw QR code (will be clipped to rounded rectangle)
    ctx.drawImage(qrImage, qrX, qrY, qrWidth, qrHeight);
    
    // Restore canvas state
    ctx.restore();
    
    console.log('QR code drawn with rounded corners');
    
    // Convert to PNG
    const pngBuffer = canvas.toBuffer('image/png');
    console.log('PNG buffer created');
    
    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const widthPt = 1080 * 0.75;
    const heightPt = 1350 * 0.75;
    
    const page = pdfDoc.addPage([widthPt, heightPt]);
    const pngImage = await pdfDoc.embedPng(pngBuffer);
    
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: widthPt,
      height: heightPt
    });
    
    const pdfBytes = await pdfDoc.save();
    console.log('PDF created successfully');
    
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
}

export async function generateTicketImage(data: TicketData): Promise<Buffer> {
  try {
    console.log('Starting PNG generation for:', data);
    
    const template = await loadImage(TICKET_TEMPLATE_URL);
    console.log('Template loaded from GitHub');
    
    const canvas = createCanvas(1080, 1350);
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.drawImage(template, 0, 0, 1080, 1350);
    
    // Generate QR code
    const qrData = JSON.stringify({
      ticketId: data.ticketId,
      name: data.name
    });
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      width: 440,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    const qrImage = await loadImage(qrCodeDataUrl);
    
    // QR code position
    const qrX = 100;
    const qrY = 800;
    const qrWidth = 440;
    const qrHeight = 440;
    const cornerRadius = 30; // Match PDF version
    
    // Save canvas state
    ctx.save();
    
    // Create clipping path with rounded corners
    roundRect(ctx, qrX, qrY, qrWidth, qrHeight, cornerRadius);
    ctx.clip();
    
    // Draw QR code (will be clipped to rounded rectangle)
    ctx.drawImage(qrImage, qrX, qrY, qrWidth, qrHeight);
    
    // Restore canvas state
    ctx.restore();
    
    console.log('PNG created successfully with rounded QR');
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('PNG Generation Error:', error);
    throw error;
  }
}

export function generateTicketId(): string {
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `NGB${randomNum}`;
}
