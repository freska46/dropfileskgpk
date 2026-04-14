import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFileFromStorage } from "@/lib/file-utils";

// GET — информация о файле
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  const { id } = await params;

  // Если пользователь авторизован — ищем его файлы
  if (session?.user?.id) {
    const file = await prisma.file.findFirst({
      where: { id, userId: session.user.id },
      include: { shareLinks: true, folder: true },
    });

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
    }

    return NextResponse.json({ file });
  }

  // Если не авторизован — показываем только публичные файлы
  const file = await prisma.file.findFirst({
    where: { id, accessType: "PUBLIC" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!file) {
    return NextResponse.json({ error: "Файл не найден или недоступен" }, { status: 404 });
  }

  return NextResponse.json({ file });
}

// PATCH — переименование / перемещение / смена доступа
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const file = await prisma.file.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!file) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  const updateData: any = {};

  if (body.name !== undefined) {
    updateData.originalName = body.name;
  }

  if (body.folderId !== undefined) {
    // Проверка что папка принадлежит пользователю
    if (body.folderId !== null) {
      const folder = await prisma.folder.findFirst({
        where: { id: body.folderId, userId: session.user.id },
      });
      if (!folder) {
        return NextResponse.json({ error: "Папка не найдена" }, { status: 404 });
      }
    }
    updateData.folderId = body.folderId;
  }

  if (body.accessType !== undefined) {
    if (["PRIVATE", "LINK_ACCESS", "PUBLIC"].includes(body.accessType)) {
      updateData.accessType = body.accessType;
    }
  }

  const updated = await prisma.file.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ file: updated });
}

// DELETE — удаление файла
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const file = await prisma.file.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!file) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  // Удаление из Supabase Storage
  await deleteFileFromStorage(session.user.id, file.storedName);

  // Удаление из БД (каскадно удалит shareLinks)
  await prisma.file.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
