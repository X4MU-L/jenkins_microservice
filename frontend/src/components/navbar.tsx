"use client";

import { useState } from "react";

import { LinkIcon, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/urls",
      label: "My URLs",
      active: pathname === "/urls",
      auth: true,
    },
    {
      href: "/create-url",
      label: "Create URL",
      active: pathname === "/create-url",
      auth: true,
    },
    {
      href: "/profile",
      label: "Profile",
      active: pathname === "/profile",
      auth: true,
    },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <LinkIcon className="h-6 w-6" />
            <span className="font-bold">URL Shortener</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {routes.map((route) => {
            if (route.auth && !isAuthenticated) return null;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "hover:text-primary text-sm font-medium transition-colors",
                  route.active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {route.label}
              </Link>
            );
          })}
          {isAuthenticated ? (
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                My Account
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="container py-4 pb-6 md:hidden">
          <nav className="flex flex-col gap-4">
            {routes.map((route) => {
              if (route.auth && !isAuthenticated) return null;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "hover:text-primary text-sm font-medium transition-colors",
                    route.active ? "text-foreground" : "text-muted-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {route.label}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  My Account
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="w-full justify-start">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
