"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, Edit, Eye, Power } from "lucide-react";

type DashboardActionsProps = {
  productId: string;
  slug: string;
  isActive: boolean;
};

export function DashboardActions({ productId, slug, isActive }: DashboardActionsProps) {
  const router = useRouter();
  const [active, setActive] = useState(isActive);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onToggle = () => {
    setError("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/products/${productId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !active }),
      });

      if (!res.ok) {
        setError("Toggle failed");
        return;
      }

      setActive(!active);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/admin/products/${productId}/results`} className="btn-secondary inline-flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4" />
          Results
        </Link>
        <Link href={`/review/${slug}/results`} className="btn-secondary inline-flex items-center gap-1.5">
          <Eye className="h-4 w-4" />
          Public
        </Link>
        <Link href={`/admin/products/${productId}/edit`} className="btn-secondary inline-flex items-center gap-1.5">
          <Edit className="h-4 w-4" />
          Edit
        </Link>
        <button type="button" onClick={onToggle} className="btn-secondary inline-flex items-center gap-1.5" disabled={isPending}>
          <Power className="h-4 w-4" />
          {isPending ? "Saving..." : active ? "Deactivate" : "Activate"}
        </button>
      </div>
      {error ? <p className="text-[12px] text-[#DC2626]">{error}</p> : null}
    </div>
  );
}
