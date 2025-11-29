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
  try {
    console.log('Starting PDF generation for:', data);
    
    // Load template from public folder
    const templatePath = path.join(process.cwd(), 'public', 'TicketDesign.png');
    console.log('Template path:', templatePath);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at: ${templatePath}`);
    }
    
    const template = await loadImage(templatePath);
    console.log('Template loaded successfully');
    
    // Create canvas with exact dimensions (1080x1350)
    const canvas = createCanvas(1080, 1350);
    const ctx = canvas.getContext('2d');
    
    // Draw background template
    ctx.drawImage(template, 0, 0, 1080, 1350);
    
    // Generate QR code with minimal data (ticketId + name only)
    const qrData = JSON.stringify({
      ticketId: data.ticketId,
      name: data.name
    });
    
    console.log('QR Data:', qrData);
    
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
    
    const qrImage = await loadImage(qrCodeDataUrl);
    
    // Position QR code in the reserved square
    // Based on your design: X=100, Y=790-800 area
    const qrX = 100;
    const qrY = 800;  // Adjusted for proper centering
    const qrWidth = 440;
    const qrHeight = 440;
    
    ctx.drawImage(qrImage, qrX, qrY, qrWidth, qrHeight);
    console.log('QR code drawn at position:', { qrX, qrY, qrWidth, qrHeight });
    
    // Convert canvas to PNG buffer
    const pngBuffer = canvas.toBuffer('image/png');
    console.log('PNG buffer created');
    
    // Create PDF from PNG (maintaining original dimensions)
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
    
    const pdfBytes = await pdfDoc.save();
    console.log('PDF created successfully');
    
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
}

/**
 * Generate PNG version of ticket (for email preview)
 * @param data - Ticket holder information
 * @returns PNG buffer
 */
export async function generateTicketImage(data: TicketData): Promise<Buffer> {
  try {
    console.log('Starting PNG generation for:', data);
    
    // Load template from public folder
    const templatePath = path.join(process.cwd(), 'public', 'TicketDesign.png');
    
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
    
    // Position QR code (same as PDF)
    const qrX = 100;
    const qrY = 800;
    const qrWidth = 440;
    const qrHeight = 440;
    
    ctx.drawImage(qrImage, qrX, qrY, qrWidth, qrHeight);
    
    console.log('PNG created successfully');
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('PNG Generation Error:', error);
    throw error;
  }
}

/**
 * Generate unique ticket ID in format NGB###
 * @returns Ticket ID (e.g., NGB234)
 */
export function generateTicketId(): string {
  const randomNum = Math.floor(Math.random() * 900) + 100;  // 100-999
  return `NGB${randomNum}`;
}
