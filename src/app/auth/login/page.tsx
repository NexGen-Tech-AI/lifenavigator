import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

// Metadata for the page
export const metadata: Metadata = {
  title: 'Sign In | Life Navigator',
  description: 'Sign in to your Life Navigator account',
};

export default function LoginPage() {
  return (
    <div>
      <LoginForm />
    </div>
  );
}