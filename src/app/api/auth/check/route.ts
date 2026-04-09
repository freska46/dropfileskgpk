import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// POST — проверить логин/пароль и сообщить, нужен ли 2FA
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  return NextResponse.json({
    twoFactorRequired: user.twoFactorEnabled,
    email: user.email,
  });
}
