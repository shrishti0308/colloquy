'use client';

import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallback,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && mounted) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, mounted]);

  // Don't render anything on server
  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return <>{fallback || <Loading fullScreen message="Verifying access..." />}</>;
  }

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
};
