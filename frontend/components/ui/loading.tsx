'use client';

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({
  message = "Loading...",
  fullScreen = false,
  size = "md",
  className,
}: LoadingProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const gifSrc =
    mounted && resolvedTheme === "dark"
      ? "/gifs/loading-dark.gif"
      : "/gifs/loading-light.gif";

  // Use max-width classes instead of fixed sizes
  const sizeClasses = {
    sm: "max-w-[300px] w-full",
    md: "max-w-[600px] w-full",
    lg: "max-w-[750px] w-full",
  };

  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center bg-background"
    : "flex items-center justify-center py-8";

  return (
    <div className={cn(containerClasses, className)}>
      <div className="text-center w-full px-4">
        <div className="mb-4 flex justify-center">
          <div className={cn(sizeClasses[size])}>
            <Image
              src={gifSrc}
              alt="Loading"
              width={500}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {message && (
          <p className="text-muted-foreground animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
}
