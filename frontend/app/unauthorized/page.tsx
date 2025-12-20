'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const gifSrc =
    mounted && resolvedTheme === 'dark'
      ? '/gifs/unauthorized-dark.gif'
      : '/gifs/unauthorized-light.gif';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-6 py-8 text-center">
        <div className="mb-8 flex justify-center">
          <div className="max-w-112.5 w-full">
            <Image
              src={gifSrc}
              alt="Unauthorized Access"
              width={500}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          Access Denied
        </h1>

        <p className="text-muted-foreground mb-8">
          You don't have permission to access this resource. Please contact your
          administrator if you believe this is an error.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => router.back()}>Go Back</Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Dashboard
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
