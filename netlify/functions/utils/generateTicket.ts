import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';

interface TicketData {
  name: string;
  ticketId: string;
}

// PASTE YOUR GITHUB RAW URL HERE
const TICKET_TEMPLATE_URL = 'https://raw.githubusercontent.com/kalpokoch/PreChristmasLangingPage/main/assets/TicketDesign.png';

export async function generateTicketPDF(data: TicketData): Promise<Buffer> {
  try {
    console.log('Starting PDF generation for:', data);
    
    // Load template from GitHub URL
    const template = await loadImage(TICKET_TEMPLATE_URL);
    console.log('Template loaded from GitHub');
    
    const canvas = createCanvas(1080, 1350);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(template, 0, 0, 1080, 1350);
    
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
    
    const qrX = 100;
    const qrY = 800;
    const qrWidth = 440;
    const qrHeight = 440;
    
    ctx.drawImage(qrImage, qrX, qrY, qrWidth, qrHeight);
    console.log('QR code drawn');
    
    const pngBuffer = canvas.toBuffer('image/png');
    console.log('PNG buffer created');
    
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
    
    ctx.drawImage(qrImage, 100, 800, 440, 440);
    console.log('PNG created successfully');
    
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
