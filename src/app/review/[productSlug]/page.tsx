import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "./review-form";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ productSlug: string }> };

export default async function ReviewPage({ params }: Params) {
  const { productSlug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    include: {
      categories: {
        orderBy: { displayOrder: "asc" },
        include: {
          options: {
            orderBy: { displayOrder: "asc" },
          },
        },
      },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <main className="page-wrap py-5">
      <div className="mx-auto max-w-3xl space-y-3">
        <Link href="/products" className="btn-secondary inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <ReviewForm
          product={{
            id: product.id,
            name: product.name,
            description: product.description,
            image: product.image,
            categories: product.categories.map((category) => ({
              id: category.id,
              name: category.name,
              options: category.options.map((option) => ({ id: option.id, label: option.label })),
            })),
          }}
        />
      </div>
    </main>
  );
}
