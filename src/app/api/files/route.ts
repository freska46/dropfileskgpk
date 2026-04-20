import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — список файлов пользователя
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");

  const where: any = { userId };
  if (folderId) {
    where.folderId = folderId;
  } else {
    where.folderId = null; // корневая директория
  }

  const files = await prisma.file.findMany({
    where,
    include: {
      shareLinks: {
        select: { id: true, token: true, downloads: true, maxDownloads: true, expiresAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Папки
  const foldersWhere: any = { userId };
  if (folderId) {
    foldersWhere.parentId = folderId;
  } else {
    foldersWhere.parentId = null;
  }

  const folders = await prisma.folder.findMany({
    where: foldersWhere,
    include: {
      _count: {
        select: { files: true, children: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Информация о хранилище
  const allFiles = await prisma.file.findMany({
    where: { userId },
    select: { size: true },
  });
  const usedStorage = allFiles.reduce((sum, f) => sum + f.size, BigInt(0));

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { storageLimit: true },
  });

  return NextResponse.json({
    files: files.map((f) => ({
      id: f.id,
      originalName: f.originalName,
      mimeType: f.mimeType,
      size: Number(f.size),
      createdAt: f.createdAt,
      accessType: f.accessType,
      thumbnailPath: f.thumbnailPath,
      shareLinks: f.shareLinks,
    })),
    folders,
    storage: {
      used: Number(usedStorage),
      limit: Number(user?.storageLimit || 0),
    },
  });
}
