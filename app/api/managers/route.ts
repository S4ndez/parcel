import { NextResponse } from 'next/server';
import { UserService } from '@/services/userService';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const managerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  apartmentId: z.string().min(1, 'Apartment assignment is required'),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const managers = await UserService.getManagers();
    return NextResponse.json({ success: true, data: managers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = managerSchema.parse(body);

    const newManager = await UserService.createUser({
      ...validatedData,
      role: 'apartment_manager',
    });

    return NextResponse.json({ success: true, data: newManager }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
