
'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Ensures the user is authenticated for protected routes.
 * Redirects to /login if not signed in.
 */
export function AuthTrigger() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth state is determined and no user is found, redirect to login
    // except if we are already on the login page.
    if (!isUserLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isUserLoading, pathname, router]);

  return null;
}
