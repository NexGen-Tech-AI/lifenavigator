import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authConfig } from '@/lib/auth-config';
import { cookies } from 'next/headers';

export default async function TestJWT() {
  // Get server session
  const session = await getServerSession(authConfig);
  
  // Get all cookies
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  
  // Get specific auth cookies
  const sessionToken = cookieStore.get('next-auth.session-token');
  const csrfToken = cookieStore.get('next-auth.csrf-token');
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">JWT Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Session Data:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cookies:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(allCookies.map(c => ({ name: c.name, valueLength: c.value.length })), null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Auth Cookies:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          Session Token: {sessionToken ? 'EXISTS' : 'NOT FOUND'}
          CSRF Token: {csrfToken ? 'EXISTS' : 'NOT FOUND'}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Environment:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          NEXTAUTH_URL: {process.env.NEXTAUTH_URL}
          NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'}
          NODE_ENV: {process.env.NODE_ENV}
        </pre>
      </div>
    </div>
  );
}