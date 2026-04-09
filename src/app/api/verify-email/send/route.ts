import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCode, sendEmailVerificationCode, TEST_MODE } from "@/lib/email";

// POST — отправить код подтверждения на email
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    // Проверка — не занят ли email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Этот email уже зарегистрирован" }, { status: 409 });
    }

    // Генерация кода
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Сохранение в БД
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        purpose: "EMAIL_VERIFY",
        expiresAt,
      },
    });

    // Отправка email
    if (TEST_MODE) {
      console.log(`\n📧 TEST MODE — Код подтверждения для ${email}: ${code}\n`);
    }

    const sent = await sendEmailVerificationCode(email, code);
    if (!sent && !TEST_MODE) {
      return NextResponse.json({ error: "Ошибка отправки email" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      testCode: TEST_MODE ? code : undefined,
      message: TEST_MODE ? "Код в консоли (тестовый режим)" : "Код отправлен на email",
    });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
