import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — список всех пользователей
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  // Проверка админа
  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      storageLimit: true,
      createdAt: true,
      _count: {
        select: { files: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

// PATCH — изменить лимит пользователя
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, storageLimit } = body;

  if (!userId || storageLimit === undefined) {
    return NextResponse.json({ error: "userId и storageLimit обязательны" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { storageLimit: BigInt(storageLimit) },
  });

  return NextResponse.json({ success: true });
}

// DELETE — удалить пользователя
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId обязателен" }, { status: 400 });
  }

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Нельзя удалить себя" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
