"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <header className="border-b border-[rgba(0,0,0,0.07)] bg-white">
      <div className="page-wrap">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between">
          <Link href="/products" className="text-[14px] font-semibold text-[#111827]">
            Product Reviews
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-[8px] px-3 text-[13px] transition-all duration-150 ease-in",
                    active ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#6B7280] hover:bg-[#F3F4F6]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <LogoutButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
