import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — проверить код подтверждения
export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email и код обязательны" }, { status: 400 });
    }

    // Найти самый свежий неиспользованный код
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
      return NextResponse.json(
        { error: "Неверный или истёкший код" },
        { status: 400 }
      );
    }

    // Пометить как использованный
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { used: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
