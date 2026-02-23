"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { slugify } from "@/lib/utils";

type OptionInput = { id?: string; label: string; displayOrder: number };
type CategoryInput = { id?: string; name: string; displayOrder: number; options: OptionInput[] };

type ProductInput = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  category: string;
  isActive: boolean;
  categories: CategoryInput[];
};

type ProductFormProps = {
  mode: "create" | "edit";
  initialData: ProductInput;
  structureLocked?: boolean;
};

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const imageBitmap = await createImageBitmap(file);
  const maxWidth = 1600;
  const maxHeight = 1600;

  const ratio = Math.min(maxWidth / imageBitmap.width, maxHeight / imageBitmap.height, 1);
  const width = Math.max(1, Math.round(imageBitmap.width * ratio));
  const height = Math.max(1, Math.round(imageBitmap.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  context.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close();

  const preferredType = "image/jpeg";
  let quality = 0.82;
  let blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), preferredType, quality);
  });

  while (blob && blob.size > 4 * 1024 * 1024 && quality > 0.52) {
    quality -= 0.08;
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), preferredType, quality);
    });
  }

  if (!blob) {
    return file;
  }

  const normalizedName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
  return new File([blob], normalizedName, { type: preferredType });
}

export function ProductForm({ mode, initialData, structureLocked = false }: ProductFormProps) {
  const router = useRouter();
  const [data, setData] = useState<ProductInput>(initialData);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [isPending, startTransition] = useTransition();

  const title = mode === "create" ? "Create Product" : "Edit Product";

  const canSubmit = useMemo(() => {
    return data.name.trim() && data.slug.trim() && data.description.trim() && data.category.trim();
  }, [data]);

  const setCategoryName = (idx: number, value: string) => {
    setData((prev) => {
      const categories = [...prev.categories];
      categories[idx] = { ...categories[idx], name: value };
      return { ...prev, categories };
    });
  };

  const setOptionLabel = (catIdx: number, optIdx: number, value: string) => {
    setData((prev) => {
      const categories = [...prev.categories];
      const options = [...categories[catIdx].options];
      options[optIdx] = { ...options[optIdx], label: value };
      categories[catIdx] = { ...categories[catIdx], options };
      return { ...prev, categories };
    });
  };

  const addCategory = () => {
    setData((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { name: "", displayOrder: prev.categories.length, options: [{ label: "", displayOrder: 0 }] },
      ],
    }));
  };

  const addOption = (catIdx: number) => {
    setData((prev) => {
      const categories = [...prev.categories];
      const category = categories[catIdx];
      categories[catIdx] = {
        ...category,
        options: [...category.options, { label: "", displayOrder: category.options.length }],
      };
      return { ...prev, categories };
    });
  };

  const removeCategory = (catIdx: number) => {
    setData((prev) => {
      const categories = prev.categories.filter((_, i) => i !== catIdx).map((cat, idx) => ({ ...cat, displayOrder: idx }));
      return { ...prev, categories };
    });
  };

  const removeOption = (catIdx: number, optIdx: number) => {
    setData((prev) => {
      const categories = [...prev.categories];
      categories[catIdx] = {
        ...categories[catIdx],
        options: categories[catIdx].options
          .filter((_, i) => i !== optIdx)
          .map((option, idx) => ({ ...option, displayOrder: idx })),
      };
      return { ...prev, categories };
    });
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setApiError("");

    let uploadFile = file;
    try {
      uploadFile = await compressImage(file);
    } catch {
      uploadFile = file;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const raw = await response.text();
    let payload: { url?: string; error?: string } = {};
    if (raw) {
      try {
        payload = JSON.parse(raw) as { url?: string; error?: string };
      } catch {
        payload = {};
      }
    }
    setIsUploading(false);

    const uploadedUrl = payload.url;

    if (!response.ok || !uploadedUrl) {
      setApiError(payload.error || "Image upload failed");
      return;
    }

    setData((prev) => ({ ...prev, image: uploadedUrl }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!data.name.trim()) nextErrors.name = "Name is required";
    if (!data.slug.trim()) nextErrors.slug = "Slug is required";
    if (!data.description.trim()) nextErrors.description = "Description is required";
    if (!data.category.trim()) nextErrors.category = "Category is required";
    if (data.categories.length < 1) nextErrors.categories = "At least one category is required";

    data.categories.forEach((category, catIdx) => {
      if (!category.name.trim()) nextErrors[`category-${catIdx}`] = "Category name is required";
      if (category.options.length < 1) nextErrors[`category-${catIdx}-options`] = "Add at least one option";
      category.options.forEach((option, optIdx) => {
        if (!option.label.trim()) {
          nextErrors[`category-${catIdx}-option-${optIdx}`] = "Option label is required";
        }
      });
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;

    setApiError("");
    startTransition(async () => {
      const payload = {
        ...data,
        categories: data.categories.map((category, catIdx) => ({
          ...category,
          displayOrder: catIdx,
          options: category.options.map((option, optIdx) => ({ ...option, displayOrder: optIdx })),
        })),
      };

      const endpoint = mode === "create" ? "/api/admin/products" : `/api/admin/products/${data.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setApiError(body.error || "Save failed");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h1 className="text-[20px] font-semibold text-[#111827]">{title}</h1>
      </div>

      <div className="card grid gap-4 p-4">
        <div className="grid gap-2">
          <label className="label">Product Name</label>
          <input
            className="input"
            value={data.name}
            onChange={(event) =>
              setData((prev) => ({
                ...prev,
                name: event.target.value,
                slug: mode === "create" ? slugify(event.target.value) : prev.slug,
              }))
            }
          />
          {errors.name ? <p className="text-[12px] text-[#DC2626]">{errors.name}</p> : null}
        </div>

        <div className="grid gap-2">
          <label className="label">Slug</label>
          <input className="input" value={data.slug} onChange={(event) => setData((prev) => ({ ...prev, slug: slugify(event.target.value) }))} />
          {errors.slug ? <p className="text-[12px] text-[#DC2626]">{errors.slug}</p> : null}
        </div>

        <div className="grid gap-2">
          <label className="label">Category</label>
          <input className="input" value={data.category} onChange={(event) => setData((prev) => ({ ...prev, category: event.target.value }))} />
          {errors.category ? <p className="text-[12px] text-[#DC2626]">{errors.category}</p> : null}
        </div>

        <div className="grid gap-2">
          <label className="label">Description</label>
          <textarea
            className="input min-h-24 py-2"
            value={data.description}
            onChange={(event) => setData((prev) => ({ ...prev, description: event.target.value }))}
          />
          {errors.description ? <p className="text-[12px] text-[#DC2626]">{errors.description}</p> : null}
        </div>

        <div className="grid gap-2">
          <label className="label">Image Upload (Vercel Blob)</label>
          <div className="flex flex-wrap items-center gap-2">
            <label className="btn-secondary inline-flex cursor-pointer items-center gap-1.5">
              <ImagePlus className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Image"}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                disabled={isUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadImage(file);
                  }
                }}
              />
            </label>
            {data.image ? <span className="caption truncate">Image attached</span> : null}
          </div>
          {data.image ? <input className="input" value={data.image} onChange={(event) => setData((prev) => ({ ...prev, image: event.target.value }))} /> : null}
        </div>

        <label className="inline-flex items-center gap-2 text-[13px] text-[#111827]">
          <input
            type="checkbox"
            checked={data.isActive}
            onChange={(event) => setData((prev) => ({ ...prev, isActive: event.target.checked }))}
            className="h-4 w-4 accent-[#2563EB]"
          />
          Active product
        </label>
      </div>

      <div className="card space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[#111827]">Review Categories</h2>
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-1.5"
            onClick={addCategory}
            disabled={structureLocked}
          >
            <Plus className="h-4 w-4" />
            Category
          </button>
        </div>
        {structureLocked ? (
          <p className="text-[12px] text-[#DC2626]">
            This product already has reviews. Category and option structure is locked to preserve existing data.
          </p>
        ) : null}
        {errors.categories ? <p className="text-[12px] text-[#DC2626]">{errors.categories}</p> : null}

        {data.categories.map((category, catIdx) => (
          <div key={`cat-${catIdx}`} className="rounded-[12px] border border-[rgba(0,0,0,0.07)] bg-[#FAFAFA] p-3">
            <div className="mb-2 flex items-center gap-2">
              <input
                className="input flex-1"
                value={category.name}
                onChange={(event) => setCategoryName(catIdx, event.target.value)}
                placeholder="Category name"
                disabled={structureLocked}
              />
              <button
                type="button"
                className="btn-danger inline-flex items-center gap-1.5"
                onClick={() => removeCategory(catIdx)}
                disabled={structureLocked}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
            {errors[`category-${catIdx}`] ? <p className="mb-2 text-[12px] text-[#DC2626]">{errors[`category-${catIdx}`]}</p> : null}

            <div className="space-y-2">
              {category.options.map((option, optIdx) => (
                <div key={`opt-${catIdx}-${optIdx}`} className="flex items-center gap-2">
                  <input
                    className="input flex-1"
                    value={option.label}
                    onChange={(event) => setOptionLabel(catIdx, optIdx, event.target.value)}
                    placeholder="Option label"
                    disabled={structureLocked}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => removeOption(catIdx, optIdx)}
                    disabled={structureLocked}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {errors[`category-${catIdx}-options`] ? <p className="text-[12px] text-[#DC2626]">{errors[`category-${catIdx}-options`]}</p> : null}
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-1.5"
                onClick={() => addOption(catIdx)}
                disabled={structureLocked}
              >
                <Plus className="h-4 w-4" />
                Add Option
              </button>
            </div>
          </div>
        ))}
      </div>

      {apiError ? <p className="text-[12px] text-[#DC2626]">{apiError}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-primary" disabled={!canSubmit || isPending} onClick={onSubmit}>
          {isPending ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
