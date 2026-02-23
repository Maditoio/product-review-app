import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Star } from "lucide-react";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function ProductResultsPage({ params }: Params) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
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
      reviews: {
        orderBy: { submittedAt: "desc" },
        include: {
          selectedOptions: {
            include: {
              categoryOption: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      },
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
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="card flex flex-wrap items-center justify-between gap-2 p-4">
          <div>
            <h1 className="text-[20px] font-semibold text-[#111827]">{product.name} Results</h1>
            <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-[#6B7280]">
              <span className="text-[20px] font-semibold text-[#111827]">{avg.toFixed(1)}</span>
              <Star className="h-5 w-5 fill-[#2563EB] text-[#2563EB]" />
              from {totalReviews} reviews
            </p>
          </div>
          <Link href={`/api/admin/products/${product.id}/export`} className="btn-secondary inline-flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            Export CSV
          </Link>
        </section>

        {product.categories.map((category) => {
          const totalSelections = category.options.reduce((acc, option) => acc + option.selections.length, 0);
          return (
            <section key={category.id} className="card p-4">
              <h2 className="text-[14px] font-semibold text-[#111827]">{category.name}</h2>
              <div className="mt-3 space-y-2">
                {category.options.map((option) => {
                  const count = option.selections.length;
                  const pct = totalSelections ? Math.round((count / totalSelections) * 100) : 0;

                  return (
                    <div key={option.id} className="grid grid-cols-[1fr_auto] items-center gap-2 text-[13px] text-[#111827]">
                      <div>
                        <p>{option.label}</p>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                          <div className="h-full bg-[#2563EB]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <p className="tabular-nums text-[#6B7280]">
                        {count} ({pct}%)
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="card overflow-x-auto p-0">
          <table className="w-full text-left text-[13px] text-[#111827]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">
                <th className="px-3 py-2">Reviewer</th>
                <th className="px-3 py-2">Star Rating</th>
                <th className="px-3 py-2">Selected Options</th>
                <th className="px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {product.reviews.map((review, index) => {
                const groupedSelections = review.selectedOptions.reduce(
                  (acc, selection) => {
                    const categoryName = selection.categoryOption.category.name;
                    const current = acc.get(categoryName) || [];
                    current.push(selection.categoryOption.label);
                    acc.set(categoryName, current);
                    return acc;
                  },
                  new Map<string, string[]>(),
                );

                return (
                  <tr key={review.id} className={index % 2 ? "bg-[#F9FAFB]" : "bg-transparent"}>
                    <td className="border-b border-[rgba(0,0,0,0.05)] px-3 py-2 align-top">{review.reviewerName || "Anonymous"}</td>
                    <td className="border-b border-[rgba(0,0,0,0.05)] px-3 py-2 tabular-nums align-top">{review.starRating}</td>
                    <td className="border-b border-[rgba(0,0,0,0.05)] px-3 py-2">
                      <div className="space-y-2">
                        {Array.from(groupedSelections.entries()).map(([categoryName, labels]) => (
                          <div key={`${review.id}-${categoryName}`} className="space-y-1">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">{categoryName}</p>
                            <div className="flex flex-wrap gap-1">
                              {labels.map((label) => (
                                <span
                                  key={`${review.id}-${categoryName}-${label}`}
                                  className="rounded-md bg-[#F1F3F6] px-2 py-1 text-[12px] text-[#374151]"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="border-b border-[rgba(0,0,0,0.05)] px-3 py-2 tabular-nums text-[#6B7280] align-top">
                      {format(review.submittedAt, "yyyy-MM-dd HH:mm")}
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
