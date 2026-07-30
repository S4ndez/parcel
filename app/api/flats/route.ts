import { NextResponse } from 'next/server';
import { FlatService } from '@/services/flatService';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const flatSchema = z.object({
  flatNumber: z.string().min(1, 'Flat number is required'),
  apartmentId: z.string().optional(),
});

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
    const all = searchParams.get('all') === 'true';

    if (!apartmentId) {
      return NextResponse.json({ success: false, error: 'Apartment ID is required' }, { status: 400 });
    }

    if (all) {
      const flats = await FlatService.getAllFlatsByApartment(apartmentId);
      return NextResponse.json({ success: true, data: flats });
    }

    const result = await FlatService.getFlatsByApartment(apartmentId, { page, limit, search });
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'apartment_manager' && session.role !== 'super_admin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = flatSchema.parse(body);

    const targetApartmentId = validatedData.apartmentId || session.apartmentId;
    if (!targetApartmentId) {
      return NextResponse.json({ success: false, error: 'Apartment ID is missing' }, { status: 400 });
    }

    const flat = await FlatService.createFlat({
      apartmentId: targetApartmentId,
      flatNumber: validatedData.flatNumber,
    });

    return NextResponse.json({ success: true, data: flat }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
