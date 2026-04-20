import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — создание папки
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await req.json();
  const { name, parentId } = body;

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: "Укажите имя папки" }, { status: 400 });
  }

  // Проверка родительской папки
  if (parentId) {
    const parent = await prisma.folder.findFirst({
      where: { id: parentId, userId: session.user.id },
    });
    if (!parent) {
      return NextResponse.json({ error: "Родительская папка не найдена" }, { status: 404 });
    }
  }

  const folder = await prisma.folder.create({
    data: {
      name: name.trim(),
      userId: session.user.id,
      parentId: parentId || null,
    },
  });

  return NextResponse.json({ folder }, { status: 201 });
}

// PATCH — переименование/перемещение папки
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("id");

  if (!folderId) {
    return NextResponse.json({ error: "ID папки обязателен" }, { status: 400 });
  }

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId: session.user.id },
  });

  if (!folder) {
    return NextResponse.json({ error: "Папка не найдена" }, { status: 404 });
  }

  const body = await req.json();
  const updateData: any = {};

  if (body.name !== undefined) {
    updateData.name = body.name.trim();
  }

  if (body.parentId !== undefined) {
    if (body.parentId !== null) {
      const parent = await prisma.folder.findFirst({
        where: { id: body.parentId, userId: session.user.id },
      });
      if (!parent) {
        return NextResponse.json({ error: "Родительская папка не найдена" }, { status: 404 });
      }
    }
    updateData.parentId = body.parentId;
  }

  const updated = await prisma.folder.update({
    where: { id: folderId },
    data: updateData,
  });

  return NextResponse.json({ folder: updated });
}

// DELETE — удаление папки
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("id");

  if (!folderId) {
    return NextResponse.json({ error: "ID папки обязателен" }, { status: 400 });
  }

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId: session.user.id },
  });

  if (!folder) {
    return NextResponse.json({ error: "Папка не найдена" }, { status: 404 });
  }

  // Каскадное удаление файлов и подпапок
  await prisma.folder.delete({ where: { id: folderId } });

  return NextResponse.json({ success: true });
}
