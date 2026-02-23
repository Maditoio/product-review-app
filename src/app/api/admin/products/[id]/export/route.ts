import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { formatISO } from "date-fns";
import { authOptions } from "@/lib/auth";
import { createReviewsCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = (await getServerSession(authOptions as never)) as { user?: { email?: string | null } } | null;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const reviews = await prisma.review.findMany({
    where: { productId: id },
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
  });

  const csv = createReviewsCsv(
    reviews.map((review) => ({
      reviewerName: review.reviewerName || "Anonymous",
      starRating: review.starRating,
      selectedOptions: review.selectedOptions
        .map((selection) => `${selection.categoryOption.category.name}: ${selection.categoryOption.label}`)
        .join(" | "),
      submittedAt: formatISO(review.submittedAt),
    })),
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=product-${id}-reviews.csv`,
    },
  });
}
