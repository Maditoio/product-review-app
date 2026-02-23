import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Params) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
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

  if (!product) {
    notFound();
  }

  const reviewCount = await prisma.review.count({ where: { productId: product.id } });

  return (
    <main className="page-wrap py-5">
      <div className="mx-auto max-w-4xl">
        <ProductForm
          mode="edit"
          structureLocked={reviewCount > 0}
          initialData={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            image: product.image || "",
            category: product.category,
            isActive: product.isActive,
            categories: product.categories.map((category) => ({
              id: category.id,
              name: category.name,
              displayOrder: category.displayOrder,
              options: category.options.map((option) => ({
                id: option.id,
                label: option.label,
                displayOrder: option.displayOrder,
              })),
            })),
          }}
        />
      </div>
    </main>
  );
}
