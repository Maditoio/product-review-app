import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submitReviewSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const parsed = submitReviewSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { productId, reviewerName, starRating, feedback, selectedOptionIds } = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      categories: {
        include: {
          options: true,
        },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not available" }, { status: 404 });
  }

  const allowedOptionIds = new Set(product.categories.flatMap((cat) => cat.options.map((opt) => opt.id)));
  const uniqueSelected = [...new Set(selectedOptionIds)];

  if (!uniqueSelected.every((id) => allowedOptionIds.has(id))) {
    return NextResponse.json({ error: "Invalid options selected" }, { status: 400 });
  }

  const byCategory = new Map<string, number>();
  for (const category of product.categories) {
    byCategory.set(category.id, 0);
  }

  const optionToCategory = new Map<string, string>();
  for (const category of product.categories) {
    for (const option of category.options) {
      optionToCategory.set(option.id, category.id);
    }
  }

  for (const optionId of uniqueSelected) {
    const categoryId = optionToCategory.get(optionId);
    if (categoryId) {
      byCategory.set(categoryId, (byCategory.get(categoryId) || 0) + 1);
    }
  }

  const missingCategory = product.categories.find((cat) => (byCategory.get(cat.id) || 0) < 1);
  if (missingCategory) {
    return NextResponse.json(
      { error: `Select at least one option for ${missingCategory.name}` },
      { status: 400 },
    );
  }

  const review = await prisma.review.create({
    data: {
      productId,
      reviewerName: reviewerName || null,
      starRating,
      feedback: feedback || null,
      selectedOptions: {
        create: uniqueSelected.map((categoryOptionId) => ({ categoryOptionId })),
      },
    },
  });

  return NextResponse.json({ ok: true, reviewId: review.id });
}
