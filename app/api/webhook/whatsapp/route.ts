import { NextResponse } from 'next/server';
import { env } from '@/config/env';
import { ResidentService } from '@/services/residentService';
import { DeliveryService } from '@/services/deliveryService';
import { formatDeliveryResponseMessage, sendWhatsAppMessage } from '@/lib/whatsapp';

// GET route for WhatsApp Webhook Verification
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST route for incoming WhatsApp webhook messages
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support both Meta WhatsApp Cloud API format and generic incoming payload
    let senderNumber = '';
    let messageText = '';

    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const msgObj = body.entry[0].changes[0].value.messages[0];
      senderNumber = msgObj.from;
      messageText = msgObj.text?.body || '';
    } else if (body.from || body.phone) {
      senderNumber = body.from || body.phone;
      messageText = body.text || body.message || 'Delivery';
    }

    if (!senderNumber) {
      return NextResponse.json({ success: true, message: 'No sender number found' });
    }

    // 1. Find resident by WhatsApp number
    const resident = await ResidentService.getResidentByWhatsApp(senderNumber);

    if (!resident) {
      const reply = `Your WhatsApp number (${senderNumber}) is not registered with any flat. Please contact your apartment manager.`;
      await sendWhatsAppMessage(senderNumber, reply);
      return NextResponse.json({ success: true, message: 'Unregistered resident' });
    }

    const flatId = (resident.flatId as any)?._id?.toString() || resident.flatId.toString();
    const flatNumber = (resident.flatId as any)?.flatNumber || 'Unknown';

    // 2. Fetch pending deliveries for mapped flat
    const pendingDeliveries = await DeliveryService.getPendingDeliveriesForFlat(flatId);

    // 3. Format response message
    const replyText = formatDeliveryResponseMessage(resident.name, flatNumber, pendingDeliveries);

    // 4. Send WhatsApp response
    await sendWhatsAppMessage(senderNumber, replyText);

    return NextResponse.json({
      success: true,
      message: 'WhatsApp webhook processed successfully',
      data: {
        resident: resident.name,
        flat: flatNumber,
        pendingCount: pendingDeliveries.length,
        replyText,
      },
    });
  } catch (error: any) {
    console.error('WhatsApp Webhook Handler Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
