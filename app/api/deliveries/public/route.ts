import { NextResponse } from 'next/server';
import { DeliveryService } from '@/services/deliveryService';
import { z } from 'zod';

const publicDeliverySchema = z.object({
  apartmentId: z.string().min(1, 'Apartment ID is required'),
  flatId: z.string().min(1, 'Flat is required'),
  courier: z.string().min(1, 'Courier name is required'),
  trackingNumber: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = publicDeliverySchema.parse(body);

    const delivery = await DeliveryService.createDelivery({
      apartmentId: validatedData.apartmentId,
      flatId: validatedData.flatId,
      courier: validatedData.courier,
      trackingNumber: validatedData.trackingNumber,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Delivery logged successfully!',
        data: delivery,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
