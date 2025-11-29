import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import * as path from 'path';
import * as fs from 'fs';

interface TicketData {
  name: string;
  ticketId: string;
}

export async function generateTicketPDF(data: TicketData): Promise<Buffer> {
  try {
    console.log('Starting PDF generation for:', data);
    
    // NEW PATH: Inside netlify/functions/assets/
    const templatePath = path.join(__dirname, '..', 'assets', 'TicketDesign.png');
    console.log('Template path:', templatePath);
    
    if (!fs.existsSync(templatePath)) {
      // Try alternative path
      const altPath = path.join(process.cwd(), 'netlify', 'functions', 'assets', 'TicketDesign.png');
      console.log('Trying alternative path:', altPath);
      
      if (!fs.existsSync(altPath)) {
        throw new Error(`Template not found at: ${templatePath} or ${altPath}`);
      }
      
      // Use alternative path
      const template = await loadImage(altPath);
      console.log('Template loaded from alternative path');
      
      return await generatePDFFromTemplate(template, data);
    }
    
    const template = await loadImage(templatePath);
    console.log('Template loaded successfully');
    
    return await generatePDFFromTemplate(template, data);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
}

// Helper function to avoid code duplication
async function generatePDFFromTemplate(template: any, data: TicketData): Promise<Buffer> {
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
    errorCorrectionLevel: 'H',
    width: 440,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  
  const qrImage = await loadImage(qrCodeDataUrl);
  
  // Position QR code in the reserved square
  const qrX = 100;
  const qrY = 800;
  const qrWidth = 440;
  const qrHeight = 440;
  
  ctx.drawImage(qrImage, qrX, qrY, qrWidth, qrHeight);
  console.log('QR code drawn at position:', { qrX, qrY, qrWidth, qrHeight });
  
  // Convert canvas to PNG buffer
  const pngBuffer = canvas.toBuffer('image/png');
  console.log('PNG buffer created');
  
  // Create PDF from PNG
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
}

export async function generateTicketImage(data: TicketData): Promise<Buffer> {
  try {
    console.log('Starting PNG generation for:', data);
    
    // NEW PATH: Inside netlify/functions/assets/
    const templatePath = path.join(__dirname, '..', 'assets', 'TicketDesign.png');
    
    if (!fs.existsSync(templatePath)) {
      const altPath = path.join(process.cwd(), 'netlify', 'functions', 'assets', 'TicketDesign.png');
      
      if (!fs.existsSync(altPath)) {
        throw new Error(`Template not found at: ${templatePath} or ${altPath}`);
      }
      
      const template = await loadImage(altPath);
      return await generateImageFromTemplate(template, data);
    }
    
    const template = await loadImage(templatePath);
    return await generateImageFromTemplate(template, data);
  } catch (error) {
    console.error('PNG Generation Error:', error);
    throw error;
  }
}

async function generateImageFromTemplate(template: any, data: TicketData): Promise<Buffer> {
  const canvas = createCanvas(1080, 1350);
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(template, 0, 0, 1080, 1350);
  
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
  
  const qrX = 100;
  const qrY = 800;
  const qrWidth = 440;
  const qrHeight = 440;
  
  ctx.drawImage(qrImage, qrX, qrY, qrWidth, qrHeight);
  
  console.log('PNG created successfully');
  return canvas.toBuffer('image/png');
}

export function generateTicketId(): string {
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `NGB${randomNum}`;
}
