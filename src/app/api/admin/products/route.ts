import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const session = (await getServerSession(authOptions as never)) as { user?: { email?: string | null } } | null;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createProductSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  const existing = await prisma.product.findUnique({ where: { slug: payload.slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      image: payload.image || null,
      category: payload.category,
      isActive: payload.isActive,
      categories: {
        create: payload.categories.map((category) => ({
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

  return NextResponse.json({ ok: true, id: product.id });
}
