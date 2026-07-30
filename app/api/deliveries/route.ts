import { NextResponse } from 'next/server';
import { DeliveryService } from '@/services/deliveryService';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const apartmentId = searchParams.get('apartmentId') || session.apartmentId;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || undefined;

    if (!apartmentId) {
      return NextResponse.json({ success: false, error: 'Apartment ID is required' }, { status: 400 });
    }

    const result = await DeliveryService.getDeliveriesByApartment(apartmentId, {
      page,
      limit,
      search,
      status,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
