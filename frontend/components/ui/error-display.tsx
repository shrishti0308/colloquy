'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  fullScreen?: boolean;
  showRetry?: boolean;
  showHome?: boolean;
  onRetry?: () => void;
  onHome?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred. Please try again.',
  fullScreen = false,
  showRetry = true,
  showHome = true,
  onRetry,
  onHome,
  className,
}: ErrorDisplayProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const gifSrc =
    mounted && resolvedTheme === 'dark'
      ? '/gifs/error-dark.gif'
      : '/gifs/error-light.gif';

  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-background'
    : 'flex items-center justify-center py-8';

  return (
    <div className={cn(containerClasses, className)}>
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

        <h2 className="text-3xl font-bold text-foreground mb-4">{title}</h2>

        <p className="text-muted-foreground mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showRetry && onRetry && <Button onClick={onRetry}>Try Again</Button>}
          {showHome && onHome && (
            <Button variant="outline" onClick={onHome}>
              Go Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
