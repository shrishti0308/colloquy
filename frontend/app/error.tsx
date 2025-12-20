'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // TODO: Log the error to an error reporting service
    console.error('Application error');
  }, [error]);

  const gifSrc =
    mounted && resolvedTheme === 'dark'
      ? '/gifs/error-dark.gif'
      : '/gifs/error-light.gif';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-6 py-8 text-center">
        <div className="mb-8 flex justify-center">
          <div className="max-w-112.5 w-full">
            <Image
              src={gifSrc}
              alt="Error"
              width={500}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          Something Went Wrong
        </h1>

        <p className="text-muted-foreground mb-2">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {error.digest && (
          <p className="text-sm text-muted-foreground mb-8">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button onClick={() => reset()}>Try Again</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
