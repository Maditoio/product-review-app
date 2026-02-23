"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { StarRating } from "@/components/star-rating";

type Category = {
  id: string;
  name: string;
  options: { id: string; label: string }[];
};

type ProductData = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  categories: Category[];
};

type ReviewFormProps = {
  product: ProductData;
};

export function ReviewForm({ product }: ReviewFormProps) {
  const [selectedByCategory, setSelectedByCategory] = useState<Record<string, string[]>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [starRating, setStarRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const flatSelectedOptions = useMemo(
    () => Object.values(selectedByCategory).flatMap((value) => value),
    [selectedByCategory],
  );

  const totalSteps = product.categories.length;
  const isLastStep = stepIndex === totalSteps - 1;
  const activeCategory = product.categories[stepIndex];

  const toggleOption = (categoryId: string, optionId: string) => {
    setSelectedByCategory((prev) => {
      const current = prev[categoryId] || [];
      const exists = current.includes(optionId);
      return {
        ...prev,
        [categoryId]: exists ? current.filter((id) => id !== optionId) : [...current, optionId],
      };
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    product.categories.forEach((category) => {
      if (!selectedByCategory[category.id] || selectedByCategory[category.id].length < 1) {
        nextErrors[`category-${category.id}`] = "Select at least one option.";
      }
    });

    if (starRating < 1) {
      nextErrors.starRating = "Overall rating is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateCurrentStep = () => {
    if (!activeCategory) {
      return true;
    }

    if ((selectedByCategory[activeCategory.id] || []).length < 1) {
      setErrors((prev) => ({
        ...prev,
        [`category-${activeCategory.id}`]: "Select at least one option.",
      }));
      return false;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next[`category-${activeCategory.id}`];
      return next;
    });
    return true;
  };

  const onSubmit = () => {
    if (!validate()) return;

    setApiError("");
    startTransition(async () => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          reviewerName,
          starRating,
          selectedOptionIds: flatSelectedOptions,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setApiError(body.error || "Submission failed");
        return;
      }

      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <section className="card mx-auto max-w-xl p-6 text-center">
        <div className="mb-3 flex justify-center">
          <CheckCircle2 className="h-9 w-9 text-[#16A34A]" />
        </div>
        <h2 className="text-[20px] font-semibold text-[#111827]">Thank you for your review</h2>
        <p className="mt-2 text-[13px] text-[#6B7280]">Your feedback has been recorded successfully.</p>
        {product.image ? (
          <div className="relative mx-auto mt-4 h-40 w-full max-w-sm overflow-hidden rounded-[12px]">
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="card p-4">
        <h1 className="text-[20px] font-semibold text-[#111827]">{product.name}</h1>
        <p className="mt-2 text-[13px] text-[#6B7280]">{product.description}</p>
        {product.image ? (
          <div className="relative mt-3 h-44 w-full overflow-hidden rounded-[12px]">
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          </div>
        ) : null}
      </div>

      {activeCategory ? (
        <div className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#111827]">{activeCategory.name}</h2>
            <p className="text-[12px] text-[#9CA3AF] tabular-nums">
              {stepIndex + 1}/{totalSteps}
            </p>
          </div>

          <div className="mt-3 grid gap-2">
            {activeCategory.options.map((option) => {
              const checked = (selectedByCategory[activeCategory.id] || []).includes(option.id);
              return (
                <label
                  key={option.id}
                  className="flex items-center gap-2 rounded-[8px] bg-[#F1F3F6] px-3 py-2 text-[13px] text-[#111827]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(activeCategory.id, option.id)}
                    className="h-4 w-4 accent-[#2563EB]"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>

          {errors[`category-${activeCategory.id}`] ? (
            <p className="mt-2 text-[12px] text-[#DC2626]">{errors[`category-${activeCategory.id}`]}</p>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              className="btn-secondary inline-flex items-center gap-1.5"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            {!isLastStep ? (
              <button
                type="button"
                className="btn-primary inline-flex items-center gap-1.5"
                onClick={() => {
                  if (!validateCurrentStep()) return;
                  setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
                }}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="card grid gap-3 p-4">
        <div>
          <p className="label">Overall Star Rating</p>
          <StarRating value={starRating} onChange={setStarRating} error={errors.starRating} />
        </div>

        <div className="grid gap-2">
          <label className="label">Reviewer Name (optional)</label>
          <input className="input" value={reviewerName} onChange={(event) => setReviewerName(event.target.value)} />
        </div>

        {apiError ? <p className="text-[12px] text-[#DC2626]">{apiError}</p> : null}

        <button type="button" className="btn-primary w-full sm:w-auto" disabled={isPending} onClick={onSubmit}>
          {isPending ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </section>
  );
}
