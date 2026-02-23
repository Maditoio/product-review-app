"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/products" })}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] text-[#6B7280] transition-all duration-150 ease-in hover:bg-[#F3F4F6]"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </button>
  );
}
