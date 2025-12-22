"use client";

import Link from "next/link";
import { APP_CONFIG } from "@/config/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="max-w-480 mx-auto py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {APP_CONFIG.APP_NAME}
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Your platform for interview preparation and coding practice.
              </p>
            </div>

            {/* Product */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold">Product</h3>
              <nav className="flex flex-col gap-2">
                <Link
                  href="/problems"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Problems
                </Link>
                <Link
                  href="/practice"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Practice
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </nav>
            </div>

            {/* Resources */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold">Resources</h3>
              <nav className="flex flex-col gap-2">
                <Link
                  href="/docs"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </Link>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href="/support"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Support
                </Link>
              </nav>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold">Legal</h3>
              <nav className="flex flex-col gap-2">
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </Link>
              </nav>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-center text-sm text-muted-foreground">
              © {currentYear} {APP_CONFIG.APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
