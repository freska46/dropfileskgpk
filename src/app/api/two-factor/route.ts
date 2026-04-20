import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCode, sendTwoFactorCode, TEST_MODE } from "@/lib/email";

// POST — включить/выключить 2FA
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { enabled } = await req.json();

  // Если включаем — отправляем тестовый код для подтверждения
  if (enabled) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    await prisma.verificationCode.create({
      data: {
        email: user.email,
        code,
        purpose: "TWO_FACTOR",
        expiresAt,
      },
    });

    if (TEST_MODE) {
      console.log(`\n🔐 TEST MODE — 2FA код для ${user.email}: ${code}\n`);
    }

    await sendTwoFactorCode(user.email, code);

    return NextResponse.json({
      success: true,
      testCode: TEST_MODE ? code : undefined,
      message: TEST_MODE ? "Код в консоли" : "Код отправлен на email",
    });
  }

  // Выключаем 2FA
  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: false },
  });

  return NextResponse.json({ success: true, message: "2FA отключена" });
}
