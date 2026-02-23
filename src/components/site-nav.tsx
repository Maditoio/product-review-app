"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutGrid, Store, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

const links = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/products", label: "Products", icon: Store },
  { href: "/admin/login", label: "Admin", icon: Shield },
];

export function SiteNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let alive = true;

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (alive) setIsLoggedIn(false);
          return;
        }

        const session = (await response.json()) as { user?: { email?: string | null } } | null;
        if (alive) {
          setIsLoggedIn(Boolean(session?.user?.email));
        }
      } catch {
        if (alive) setIsLoggedIn(false);
      }
    };

    void checkSession();

    return () => {
      alive = false;
    };
  }, [pathname]);

  return (
    <header className="border-b border-[rgba(0,0,0,0.07)] bg-white">
      <div className="page-wrap">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-2 py-2 sm:h-12 sm:flex-row sm:items-center sm:justify-between sm:py-0">
          <Link href="/products" className="text-[14px] font-semibold text-[#111827]">
            Product Reviews
          </Link>
          <nav className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:flex-nowrap">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] transition-all duration-150 ease-in",
                    active ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#6B7280] hover:bg-[#F3F4F6]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {isLoggedIn ? <LogoutButton /> : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
