'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { AuthBootstrap } from './auth-bootstrap';
import { DgaNativeChrome } from './dga-native-chrome';
import { DgaNativeRuntimeProvider } from './dga-native-runtime';

function RouteAwareAuthBootstrap({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // A Tang Rat WebView arrival can carry a different person than the browser's
  // previous session. Do not hydrate that previous session on the handoff page.
  if (pathname === '/auth/dga') return <>{children}</>;

  return <AuthBootstrap>{children}</AuthBootstrap>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30000,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <DgaNativeRuntimeProvider>
        <DgaNativeChrome />
        <RouteAwareAuthBootstrap>
          {children}
        </RouteAwareAuthBootstrap>
      </DgaNativeRuntimeProvider>
    </QueryClientProvider>
  );
}
