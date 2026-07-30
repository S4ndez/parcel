import QRCode from 'qrcode';
import { env } from '@/config/env';

/**
 * Generate base64 Data URL for Apartment Public Delivery Page
 */
export async function generateApartmentQRCode(apartmentId: string): Promise<string> {
  const deliveryUrl = `${env.NEXT_PUBLIC_APP_URL}/delivery/${apartmentId}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(deliveryUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}
