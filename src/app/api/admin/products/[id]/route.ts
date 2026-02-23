import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/lib/schemas";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = (await getServerSession(authOptions as never)) as { user?: { email?: string | null } } | null;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = updateProductSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.id !== id) {
    return NextResponse.json({ error: "Mismatched product id" }, { status: 400 });
  }

  const slugConflict = await prisma.product.findFirst({
    where: {
      slug: parsed.data.slug,
      id: { not: id },
    },
  });

  if (slugConflict) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const reviewCount = await prisma.review.count({ where: { productId: id } });

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        image: parsed.data.image || null,
        category: parsed.data.category,
        isActive: parsed.data.isActive,
        categories: reviewCount
          ? undefined
          : {
              deleteMany: {},
              create: parsed.data.categories.map((category) => ({
                name: category.name,
                displayOrder: category.displayOrder,
                options: {
                  create: category.options.map((option) => ({
                    label: option.label,
                    displayOrder: option.displayOrder,
                  })),
                },
              })),
            },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Unable to update product with current review data. Try changing basic fields only." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  if (reviewCount) {
    return NextResponse.json({
      ok: true,
      warning: "Product details updated. Categories/options were kept because reviews already exist.",
    });
  }

  return NextResponse.json({ ok: true });
}
