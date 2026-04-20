import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET — получить настройки
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      storageLimit: true,
      createdAt: true,
      settings: true,
    },
  });

  return NextResponse.json({ user });
}

// PATCH — обновить настройки
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await req.json();

  // Обновление профиля
  if (body.name !== undefined) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: body.name },
    });
  }

  // Обновление email
  if (body.email !== undefined) {
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "Email уже занят" }, { status: 409 });
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: body.email },
    });
  }

  // Смена пароля
  if (body.currentPassword && body.newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });

    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Текущий пароль неверный" }, { status: 400 });
    }

    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: "Пароль минимум 8 символов" }, { status: 400 });
    }
    if (!/[a-zA-Zа-яА-ЯёЁ]/.test(body.newPassword)) {
      return NextResponse.json({ error: "Пароль должен содержать хотя бы одну букву" }, { status: 400 });
    }
    if (!/[0-9]/.test(body.newPassword)) {
      return NextResponse.json({ error: "Пароль должен содержать хотя бы одну цифру" }, { status: 400 });
    }

    const newHash = await bcrypt.hash(body.newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    });
  }

  // Обновление настроек
  if (body.settings) {
    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...body.settings,
      },
      update: body.settings,
    });
  }

  // 2FA
  if (body.twoFactorEnabled !== undefined) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: body.twoFactorEnabled },
    });
  }

  return NextResponse.json({ success: true });
}
