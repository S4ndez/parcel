import axios from 'axios';
import { env } from '@/config/env';

/**
 * Format delivery list into WhatsApp message response string
 */
export function formatDeliveryResponseMessage(
  residentName: string,
  flatNumber: string,
  deliveries: Array<{ courier: string; deliveredAt: Date | string }>
): string {
  if (!deliveries || deliveries.length === 0) {
    return `Hi ${residentName} (Flat ${flatNumber}),\n\nNo pending deliveries found.`;
  }

  const count = deliveries.length;
  let message = `Hi ${residentName} (Flat ${flatNumber}),\n\nYou have ${count} pending ${
    count === 1 ? 'delivery' : 'deliveries'
  }.\n\n`;

  const now = new Date();

  deliveries.forEach((d, index) => {
    const dateObj = new Date(d.deliveredAt);
    const isToday =
      dateObj.getDate() === now.getDate() &&
      dateObj.getMonth() === now.getMonth() &&
      dateObj.getFullYear() === now.getFullYear();

    const dateStr = isToday
      ? 'Delivered Today'
      : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    message += `${index + 1}.\n${d.courier}\n${dateStr}\n${timeStr}\n\n`;
  });

  return message.trim();
}

/**
 * Send WhatsApp text message via Meta Cloud API or mock logger
 */
export async function sendWhatsAppMessage(toPhone: string, textPayload: string) {
  if (!env.WHATSAPP_TOKEN) {
    console.log(`[Mock WhatsApp Send to ${toPhone}]:\n${textPayload}`);
    return { success: true, mock: true };
  }

  try {
    const response = await axios.post(
      'https://graph.facebook.com/v18.0/me/messages',
      {
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'text',
        text: { body: textPayload },
      },
      {
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}
