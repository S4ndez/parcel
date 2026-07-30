import { NextResponse } from 'next/server';
import { ResidentService } from '@/services/residentService';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const residentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  whatsappNumber: z.string().min(8, 'Valid WhatsApp number is required'),
  flatId: z.string().min(1, 'Flat assignment is required'),
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

    if (!apartmentId) {
      return NextResponse.json({ success: false, error: 'Apartment ID is required' }, { status: 400 });
    }

    const result = await ResidentService.getResidentsByApartment(apartmentId, { page, limit, search });
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
    const validatedData = residentSchema.parse(body);

    const targetApartmentId = validatedData.apartmentId || session.apartmentId;
    if (!targetApartmentId) {
      return NextResponse.json({ success: false, error: 'Apartment ID is missing' }, { status: 400 });
    }

    const resident = await ResidentService.createResident({
      apartmentId: targetApartmentId,
      flatId: validatedData.flatId,
      name: validatedData.name,
      whatsappNumber: validatedData.whatsappNumber,
    });

    return NextResponse.json({ success: true, data: resident }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
