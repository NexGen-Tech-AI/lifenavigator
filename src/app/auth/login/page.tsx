import { Metadata } from 'next';
import StableLoginPage from './stable-page';

export const metadata: Metadata = {
  title: 'Sign In | Life Navigator',
  description: 'Sign in to your Life Navigator account',
};

export default function LoginPage() {
  return <StableLoginPage />;
}