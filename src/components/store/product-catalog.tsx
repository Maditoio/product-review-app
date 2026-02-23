import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type ProductCatalogProps = {
  title: string;
  description: string;
};

export async function ProductCatalog({ title, description }: ProductCatalogProps) {
  const session = (await getServerSession(authOptions as never)) as { user?: { email?: string | null } } | null;
  const canViewSummary = Boolean(session?.user?.email);

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { reviews: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <section className="card p-4">
        <h1 className="text-[20px] font-semibold text-[#111827]">{title}</h1>
        <p className="mt-2 text-[13px] text-[#6B7280]">{description}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="card p-4">
            <div className="relative mb-3 h-56 rounded-[12px] bg-[#F1F3F6] flex items-center justify-center">
              {product.image ? <Image src={product.image} alt={product.name} fill className="object-contain p-2" /> : null}
            </div>
            <h2 className="text-[14px] font-semibold text-[#111827]">{product.name}</h2>
            <p className="mt-1 line-clamp-2 text-[13px] text-[#6B7280]">{product.description}</p>
            <p className="mt-2 text-[12px] text-[#9CA3AF]">
              {product.reviews.length} review{product.reviews.length === 1 ? "" : "s"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link href={`/review/${product.slug}`} className="btn-primary inline-flex items-center gap-1.5">
                Review
                <ArrowRight className="h-4 w-4" />
              </Link>
              {canViewSummary ? (
                <Link href={`/review/${product.slug}/results`} className="btn-secondary inline-flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  Summary
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      {!products.length ? (
        <section className="card p-4">
          <p className="text-[13px] text-[#6B7280]">No active products are available for review right now.</p>
        </section>
      ) : null}
    </div>
  );
}
