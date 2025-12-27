'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const gifSrc =
    mounted && resolvedTheme === 'dark'
      ? '/gifs/404-dark.gif'
      : '/gifs/404-light.gif';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-6 py-8 text-center">
        <div className="mb-8 flex justify-center">
          <div className="max-w-112.5 w-full">
            <Image
              src={gifSrc}
              alt="404 Not Found"
              width={500}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>

        <p className="text-muted-foreground mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
