import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = (await getServerSession(authOptions as never)) as { user?: { email?: string | null } } | null;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());

  return NextResponse.json({
    ok: true,
    hasBlobToken,
  });
}
