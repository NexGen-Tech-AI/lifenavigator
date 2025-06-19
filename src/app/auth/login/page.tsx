import { Metadata } from 'next';
import LoginClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Sign In | Life Navigator',
  description: 'Sign in to your Life Navigator account',
};

export default function LoginPage() {
  return <LoginClientPage />;
}