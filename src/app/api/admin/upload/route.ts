import { getServerSession } from "next-auth/next";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const uploadSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  size: z.number().int().positive().max(10 * 1024 * 1024),
});

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions as never)) as { user?: { email?: string | null } } | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const parsed = uploadSchema.safeParse({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid file", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Missing BLOB_READ_WRITE_TOKEN in environment" },
        { status: 500 },
      );
    }

    const blob = await put(`products/${Date.now()}-${file.name}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
