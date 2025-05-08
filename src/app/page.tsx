import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';

export default async function Home() {
  // The middleware will handle all redirections based on authentication status
  // This page should never be directly rendered
  redirect('/auth/login');
}