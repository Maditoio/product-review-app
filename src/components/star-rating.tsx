"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  error?: string;
};

export function StarRating({ value, onChange, error }: StarRatingProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const current = index + 1;
          const active = current <= value;
          return (
            <button
              key={current}
              type="button"
              onClick={() => onChange(current)}
              className="rounded-md p-1 transition-all duration-150 ease-in hover:-translate-y-px"
              aria-label={`Set ${current} stars`}
            >
              <Star
                className={cn("h-5 w-5", active ? "fill-[#2563EB] text-[#2563EB]" : "text-[#9CA3AF]")}
              />
            </button>
          );
        })}
      </div>
      {error ? <p className="text-[12px] text-[#DC2626]">{error}</p> : null}
    </div>
  );
}
