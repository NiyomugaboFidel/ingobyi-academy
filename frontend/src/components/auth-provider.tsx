'use client';

import { useEffect, type ReactNode } from 'react';
import { getMe, refreshToken } from '@/lib/api/auth';
import { applyAuthSession } from '@/lib/api/session';
import { useAuthStore } from '@/lib/auth/store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    async function bootstrap() {
      if (accessToken) {
        try {
          const user = await getMe(accessToken);
          setAuth(accessToken, user);
          const { syncWorkspaceFromUser } = await import('@/lib/api/session');
          syncWorkspaceFromUser(user);
          return;
        } catch {
          /* try refresh */
        }
      }
      try {
        const data = await refreshToken();
        applyAuthSession(data);
      } catch {
        clearAuth();
      }
    }
    bootstrap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
