import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — список всех публичных файлов (для ленты)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  const files = await prisma.file.findMany({
    where: {
      accessType: "PUBLIC",
    },
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      size: true,
      createdAt: true,
      thumbnailPath: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip,
  });

  const total = await prisma.file.count({
    where: { accessType: "PUBLIC" },
  });

  return NextResponse.json({
    files: files.map((f) => ({
      ...f,
      size: Number(f.size),
      authorName: f.user.name || f.user.email.split("@")[0],
    })),
    total,
    page,
    hasMore: skip + files.length < total,
  });
}
