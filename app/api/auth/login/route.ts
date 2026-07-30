import { NextResponse } from 'next/server';
import { UserService } from '@/services/userService';
import { setAuthCookie } from '@/lib/jwt';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);

    // Auto-seed admin if no super admin exists yet
    await UserService.seedInitialAdmin();

    const authResult = await UserService.authenticateUser(
      validatedData.email,
      validatedData.password
    );

    if (!authResult) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    await setAuthCookie(authResult.token);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: authResult.user,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
