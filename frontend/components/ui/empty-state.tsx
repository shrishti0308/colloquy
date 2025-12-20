'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  imageSrc?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  imageSrc = '/gifs/empty',
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If imageSrc doesn't include extension, add theme-based version
  const gifSrc = imageSrc.includes('.gif')
    ? imageSrc
    : mounted && resolvedTheme === 'dark'
    ? `${imageSrc}-dark.gif`
    : `${imageSrc}-light.gif`;

  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div className="max-w-md w-full px-6 text-center">
        <div className="mb-6 flex justify-center">
          <div className="max-w-100 w-full">
            <Image
              src={gifSrc}
              alt="Empty state"
              width={500}
              height={500}
              className="w-full h-auto"
            />
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-foreground mb-3">
          {title}
        </h3>

        {description && (
          <p className="text-muted-foreground mb-6">{description}</p>
        )}

        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
      </div>
    </div>
  );
}
