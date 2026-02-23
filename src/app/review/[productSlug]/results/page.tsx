import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ productSlug: string }> };

export default async function PublicResultsPage({ params }: Params) {
  const session = (await getServerSession(authOptions as never)) as { user?: { email?: string | null } } | null;
  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const { productSlug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    include: {
      categories: {
        orderBy: { displayOrder: "asc" },
        include: {
          options: {
            orderBy: { displayOrder: "asc" },
            include: {
              selections: true,
            },
          },
        },
      },
      reviews: true,
    },
  });

  if (!product) {
    notFound();
  }

  const totalReviews = product.reviews.length;
  const avg = totalReviews
    ? product.reviews.reduce((acc, curr) => acc + curr.starRating, 0) / totalReviews
    : 0;

  return (
    <main className="page-wrap py-5">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link href="/products" className="btn-secondary inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <section className="card p-4">
          <h1 className="text-[20px] font-semibold text-[#111827]">{product.name} Summary</h1>
          <p className="mt-2 inline-flex items-center gap-1 text-[13px] text-[#6B7280]">
            <span className="font-semibold text-[#111827]">{avg.toFixed(1)}</span>
            <Star className="h-4 w-4 fill-[#2563EB] text-[#2563EB]" />
            from {totalReviews} reviews
          </p>
        </section>

        {product.categories.map((category) => {
          const categoryTotal = category.options.reduce((acc, option) => acc + option.selections.length, 0);
          return (
            <section key={category.id} className="card p-4">
              <h2 className="text-[14px] font-semibold text-[#111827]">{category.name}</h2>
              <div className="mt-3 space-y-2">
                {category.options.map((option) => {
                  const count = option.selections.length;
                  const pct = categoryTotal ? Math.round((count / categoryTotal) * 100) : 0;
                  return (
                    <div key={option.id} className="grid grid-cols-[1fr_auto] items-center gap-2 text-[13px] text-[#111827]">
                      <div>
                        <p>{option.label}</p>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                          <div className="h-full bg-[#2563EB]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <p className="tabular-nums text-[#6B7280]">{count} ({pct}%)</p>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
