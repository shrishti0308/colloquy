'use client';

import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && mounted) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  // Don't render anything on server
  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return <>{fallback || <Loading fullScreen message="Loading..." />}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
