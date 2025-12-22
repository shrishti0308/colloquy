"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { NAVIGATION_ITEMS } from "@/config/navigation";
import { APP_CONFIG } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Desktop Navigation
  const DesktopNav = () => (
    <div className="hidden md:flex items-center gap-6">
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          {NAVIGATION_ITEMS.map((item) => (
            <NavigationMenuItem key={item.title}>
              {item.subItems ? (
                <>
                  <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 p-4 w-100">
                      {item.subItems.map((subItem) => (
                        <ListItem
                          key={subItem.title}
                          title={subItem.title}
                          href={subItem.href}
                        >
                          {subItem.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href={item.href || "#"}>{item.title}</Link>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );

  // Mobile Navigation (Sheet)
  const MobileNav = () => {
    const [open, setOpen] = useState(false);

    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <MenuIcon className="size-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-75 sm:w-87.5">
          <SheetHeader className="px-3">
            <SheetTitle className="text-left text-2xl">
              {APP_CONFIG.APP_NAME}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 mt-8 px-3 h-full justify-between mb-3">
            <nav className="flex flex-col gap-2">
              <Accordion type="single" collapsible className="w-full">
                {NAVIGATION_ITEMS.map((item, index) =>
                  item.subItems ? (
                    <AccordionItem
                      key={item.title}
                      value={`item-${index}`}
                      className="border-b-0"
                    >
                      <AccordionTrigger className="text-base font-medium hover:no-underline py-3">
                        {item.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-2 pl-2 pt-2">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.title}
                              href={subItem.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex flex-col gap-1 p-3 rounded-md hover:bg-accent transition-colors",
                                pathname === subItem.href && "bg-accent"
                              )}
                            >
                              <span className="font-medium text-sm">
                                {subItem.title}
                              </span>
                              {subItem.description && (
                                <span className="text-xs text-muted-foreground">
                                  {subItem.description}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <Link
                      key={item.title}
                      href={item.href || "#"}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center py-3 text-base font-medium rounded-md hover:bg-accent transition-colors px-0 border-b last:border-b-0",
                        pathname === item.href && "bg-accent px-3"
                      )}
                    >
                      {item.title}
                    </Link>
                  )
                )}
              </Accordion>
            </nav>

            {isAuthenticated && user && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors border-t"
              >
                <Avatar className="size-10">
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </Link>
            )}

            {!isAuthenticated && (
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                <Button asChild onClick={() => setOpen(false)}>
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 max-w-480 mx-auto">
          {/* Left section - Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {APP_CONFIG.APP_NAME}
            </span>
          </Link>

          {/* Middle section - Desktop Navigation */}
          <DesktopNav />

          {/* Right section - Auth/Profile for desktop, Menu button for mobile */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <MobileNav />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
