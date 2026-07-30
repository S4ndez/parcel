import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'super_admin') {
    redirect('/admin');
  } else if (session.role === 'apartment_manager') {
    redirect('/manager');
  }

  redirect('/login');
}
