'use client';

import React, { useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ToastProvider } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { createPersistentQueryClient } from '@/lib/cache/persistQueryClient';
import { CsrfProvider } from '@/components/ui/csrf-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create the client in a state to ensure it's only created once on the client side
  // This is important for Next.js to avoid hydration mismatches
  const [queryClient] = useState(() => createPersistentQueryClient());
  
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <CsrfProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </CsrfProvider>
        </NextThemesProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}