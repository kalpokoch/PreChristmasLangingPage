import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import * as path from 'path';
import * as fs from 'fs';

interface TicketData {
  name: string;
  ticketId: string;
}

/**
 * Generate ticket PDF with QR code overlay on template image
 * @param data - Ticket holder information
 * @returns PDF buffer
 */
export async function generateTicketPDF(data: TicketData): Promise<Buffer> {
  // 1. Load the ticket template image (PNG from assets/)
  const templatePath = path.join(process.cwd(), 'assets', 'TicketDesign.png');
  
  // Check if file exists
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at: ${templatePath}`);
  }
  
  const template = await loadImage(templatePath);
  
  // 2. Create canvas with exact dimensions (1080x1350)
  const canvas = createCanvas(1080, 1350);
  const ctx = canvas.getContext('2d');
  
  // 3. Draw the background template
  ctx.drawImage(template, 0, 0, 1080, 1350);
  
  // 4. Generate QR Code with minimal data (name + ticketId only)
  const qrData = JSON.stringify({
    ticketId: data.ticketId,
    name: data.name
  });
  
  // Generate QR as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'H',  // High error correction
    width: 440,                  // Match your box width
    margin: 1,                   // Minimal margin
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  
  // 5. Load QR code image
  const qrImage = await loadImage(qrCodeDataUrl);
  
  // 6. Position QR code in the reserved square
  // Based on your screenshot: X=100, Y=790, W=440, H=460
  const qrX = 100;
  const qrY = 790;
  const qrWidth = 440;
  const qrHeight = 440;  // QR codes should be square for best scanning
  
  // Center the square QR in your rectangular box if needed
  const qrYCentered = 790 + (460 - 440) / 2;  // Center vertically in the 460px height box
  
  ctx.drawImage(qrImage, qrX, qrYCentered, qrWidth, qrHeight);
  
  // 7. Convert canvas to PNG buffer
  const pngBuffer = canvas.toBuffer('image/png');
  
  // 8. Create PDF from PNG (maintaining original dimensions)
  const pdfDoc = await PDFDocument.create();
  
  // Convert px to points (1px ≈ 0.75pt for 96 DPI)
  const widthPt = 1080 * 0.75;   // ~810pt
  const heightPt = 1350 * 0.75;  // ~1012.5pt
  
  const page = pdfDoc.addPage([widthPt, heightPt]);
  
  // Embed the PNG image
  const pngImage = await pdfDoc.embedPng(pngBuffer);
  
  // Draw image at full page size
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: widthPt,
    height: heightPt
  });
  
  // 9. Save PDF as buffer
  const pdfBytes = await pdfDoc.save();
  
  return Buffer.from(pdfBytes);
}

/**
 * Generate PNG version of ticket (for email preview)
 * @param data - Ticket holder information
 * @returns PNG buffer
 */
export async function generateTicketImage(data: TicketData): Promise<Buffer> {
  // Load template
  const templatePath = path.join(process.cwd(), 'assets', 'TicketDesign.png');
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at: ${templatePath}`);
  }
  
  const template = await loadImage(templatePath);
  
  // Create canvas
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
  
  // Position QR code
  const qrX = 100;
  const qrY = 800;  // Slightly adjusted for vertical centering
  const qrWidth = 440;
  const qrHeight = 440;
  
  ctx.drawImage(qrImage, qrX, qrY, qrWidth, qrHeight);
  
  // Return PNG buffer
  return canvas.toBuffer('image/png');
}

/**
 * Generate unique ticket ID in format NGB###
 * @returns Ticket ID (e.g., NGB234)
 */
export function generateTicketId(): string {
  const randomNum = Math.floor(Math.random() * 900) + 100;  // 100-999
  return `NGB${randomNum}`;
}
