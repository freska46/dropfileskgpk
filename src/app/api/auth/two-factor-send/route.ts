import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCode, sendTwoFactorCode, TEST_MODE } from "@/lib/email";

// POST — отправить 2FA код на email
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.twoFactorEnabled) {
    return NextResponse.json({ error: "2FA не включена" }, { status: 400 });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.verificationCode.create({
    data: {
      email,
      code,
      purpose: "TWO_FACTOR",
      expiresAt,
    },
  });

  if (TEST_MODE) {
    console.log(`\n🔐 TEST MODE — 2FA код для ${email}: ${code}\n`);
  }

  const sent = await sendTwoFactorCode(email, code);
  if (!sent && !TEST_MODE) {
    return NextResponse.json({ error: "Ошибка отправки" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    testCode: TEST_MODE ? code : undefined,
  });
}
