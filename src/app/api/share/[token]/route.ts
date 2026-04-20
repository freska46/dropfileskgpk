import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFileByShareToken } from "@/lib/access-control";

// GET — информация о файле по секретной ссылке
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const link = await getFileByShareToken(token);

  if (!link) {
    return NextResponse.json(
      { error: "Ссылка недействительна или истекла" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    file: {
      id: link.file.id,
      originalName: link.file.originalName,
      mimeType: link.file.mimeType,
      size: Number(link.file.size),
      createdAt: link.file.createdAt,
      thumbnailPath: link.file.thumbnailPath,
    },
    downloads: link.downloads,
    maxDownloads: link.maxDownloads,
    expiresAt: link.expiresAt,
  });
}
