import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { DashboardActions } from "@/components/admin/dashboard-actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const products = await prisma.product.findMany({
    include: {
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="page-wrap py-5">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="card flex flex-wrap items-center justify-between gap-2 p-4">
          <div>
            <h1 className="text-[20px] font-semibold text-[#111827]">Dashboard</h1>
            <p className="text-[13px] text-[#6B7280]">Manage products and monitor review results.</p>
          </div>
          <Link href="/admin/products/new" className="btn-primary">
            New Product
          </Link>
        </section>

        <section className="card overflow-x-auto p-0">
          <table className="w-full text-left text-[13px] text-[#111827]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Reviews</th>
                <th className="px-3 py-2">Avg Rating</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const count = product.reviews.length;
                const avg = count ? product.reviews.reduce((acc, curr) => acc + curr.starRating, 0) / count : 0;

                return (
                  <tr key={product.id} className={index % 2 ? "bg-[#F9FAFB]" : "bg-transparent"}>
                    <td className="border-b border-[rgba(0,0,0,0.05)] px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="relative h-10 w-10 rounded-lg bg-[#F1F3F6] flex items-center justify-center">
                          {product.image ? <Image src={product.image} alt={product.name} fill className="object-contain p-1" /> : null}
                        </div>
                        <div>
                          <p className="font-medium text-[#111827]">{product.name}</p>
                          <p className="text-[12px] text-[#6B7280]">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-[rgba(0,0,0,0.05)] px-3 py-2 tabular-nums">{count}</td>
                    <td className="border-b border-[rgba(0,0,0,0.05)] px-3 py-2 tabular-nums">{avg.toFixed(1)}</td>
                    <td className="border-b border-[rgba(0,0,0,0.05)] px-3 py-2">
                      <span className={product.isActive ? "status-active" : "status-inactive"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="border-b border-[rgba(0,0,0,0.05)] px-3 py-2">
                      <DashboardActions productId={product.id} slug={product.slug} isActive={product.isActive} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
