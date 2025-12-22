"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import {
  NAVBAR_EXCLUDED_ROUTES,
  FOOTER_EXCLUDED_ROUTES,
} from "@/config/navigation";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const shouldShowNavbar = !NAVBAR_EXCLUDED_ROUTES.some((route) => {
    // Handle dynamic routes
    if (route.includes("[")) {
      const pattern = route.replace(/\[.*?\]/g, "[^/]+");
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname.startsWith(route);
  });

  const shouldShowFooter = !FOOTER_EXCLUDED_ROUTES.some((route) => {
    if (route.includes("[")) {
      const pattern = route.replace(/\[.*?\]/g, "[^/]+");
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname.startsWith(route);
  });

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {shouldShowFooter && <Footer />}
    </>
  );
}
