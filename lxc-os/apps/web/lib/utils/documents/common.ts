import PDFDocument from 'pdfkit';
import bwipjs from 'bwip-js';
import axios from 'axios';

export async function fetchImageAsBuffer(url: string): Promise<Buffer | null> {
  try {
    if (!url || !url.startsWith('http')) return null;
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
    return Buffer.from(response.data);
  } catch (err) {
    console.warn(`Failed to fetch image from ${url}:`, err);
    return null;
  }
}

export async function placeImage(
  doc: PDFKit.PDFDocument,
  imageUrl: string | null | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
  placeholderText: string = 'Photo'
): Promise<void> {
  if (!imageUrl) {
    doc.rect(x, y, width, height).fill('#f0f0f0').stroke('#ccc');
    doc.fillColor('#666').fontSize(8).text(placeholderText, x, y + height / 2, { width, align: 'center' });
    return;
  }
  try {
    const imageBuffer = await fetchImageAsBuffer(imageUrl);
    if (imageBuffer) {
      doc.image(imageBuffer, x, y, { width, height, fit: [width, height] });
    } else {
      doc.rect(x, y, width, height).fill('#f0f0f0').stroke('#ccc');
    }
  } catch (err) {
    doc.rect(x, y, width, height).fill('#f0f0f0').stroke('#ccc');
  }
}

export async function generateQRCode(text: string): Promise<Buffer | null> {
  try {
    return await bwipjs.toBuffer({
      bcid: 'qrcode',
      text: text,
      scale: 3,
      height: 10,
      includetext: false
    });
  } catch (err) {
    console.error('QR code generation failed', err);
    return null;
  }
}

export async function generateBarcode(text: string): Promise<Buffer | null> {
  try {
    return await bwipjs.toBuffer({
      bcid: 'code128',
      text: text,
      scale: 2,
      height: 10,
      includetext: false
    });
  } catch (err) {
    console.error('Barcode generation failed', err);
    return null;
  }
}
