import { NextResponse } from 'next/server';
import { UserService } from '@/services/userService';

export async function POST() {
  try {
    const result = await UserService.seedInitialAdmin();
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Seeding failed' },
      { status: 500 }
    );
  }
}
