import { NextResponse } from 'next/server';
import { ApartmentService } from '@/services/apartmentService';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const apartment = await ApartmentService.getApartmentById(id);
    if (!apartment) {
      return NextResponse.json({ success: false, error: 'Apartment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: apartment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const apartment = await ApartmentService.updateApartment(id, body);
    return NextResponse.json({ success: true, data: apartment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await ApartmentService.deleteApartment(id);
    return NextResponse.json({ success: true, message: 'Apartment deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
