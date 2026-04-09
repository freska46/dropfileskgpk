import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// POST — сброс пароля после подтверждения кода
export async function POST(req: NextRequest) {
  const { email, code, newPassword } = await req.json();

  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
  }

  // Валидация пароля
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Пароль минимум 8 символов" }, { status: 400 });
  }
  if (!/[a-zA-Zа-яА-ЯёЁ]/.test(newPassword)) {
    return NextResponse.json({ error: "Пароль должен содержать хотя бы одну букву" }, { status: 400 });
  }
  if (!/[0-9]/.test(newPassword)) {
    return NextResponse.json({ error: "Пароль должен содержать хотя бы одну цифру" }, { status: 400 });
  }

  // Проверка кода
  const verification = await prisma.verificationCode.findFirst({
    where: {
      email,
      code,
      purpose: "EMAIL_VERIFY",
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!verification) {
    return NextResponse.json({ error: "Неверный или истёкший код" }, { status: 400 });
  }

  // Помечаем код как использованный
  await prisma.verificationCode.update({
    where: { id: verification.id },
    data: { used: true },
  });

  // Обновляем пароль
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  return NextResponse.json({ success: true });
}
