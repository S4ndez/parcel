import { NextResponse } from 'next/server';
import { StatsService } from '@/services/statsService';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'super_admin') {
      const stats = await StatsService.getSuperAdminStats();
      return NextResponse.json({ success: true, data: stats });
    } else if (session.role === 'apartment_manager') {
      if (!session.apartmentId) {
        return NextResponse.json(
          { success: false, error: 'No apartment associated with manager' },
          { status: 400 }
        );
      }
      const stats = await StatsService.getManagerStats(session.apartmentId);
      return NextResponse.json({ success: true, data: stats });
    }

    return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 403 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
