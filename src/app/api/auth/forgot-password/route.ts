import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCode, sendEmailVerificationCode, TEST_MODE } from "@/lib/email";

// POST — отправить код сброса пароля
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
  }

  // Проверяем, существует ли пользователь
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Не раскрываем, существует ли email — для безопасности
    return NextResponse.json({ success: true });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

  await prisma.verificationCode.create({
    data: {
      email,
      code,
      purpose: "EMAIL_VERIFY", // переиспользуем тот же тип
      expiresAt,
    },
  });

  if (TEST_MODE) {
    console.log(`\n🔑 TEST MODE — Код сброса пароля для ${email}: ${code}\n`);
  }

  const sent = await sendEmailVerificationCode(email, code);
  if (!sent && !TEST_MODE) {
    return NextResponse.json({ error: "Ошибка отправки email" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    testCode: TEST_MODE ? code : undefined,
    message: TEST_MODE ? "Код в консоли" : "Код отправлен на email",
  });
}
