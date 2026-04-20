import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateShareLink, revokeShareLink } from "@/lib/access-control";

// POST — создать ссылку или изменить доступ
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;

  const file = await prisma.file.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!file) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  const body = await req.json();

  // Создание ссылки
  if (body.action === "create-link") {
    const token = await generateShareLink(id, session.user.id, {
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      maxDownloads: body.maxDownloads || undefined,
    });

    const fullUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/s/${token}`;

    return NextResponse.json({ token, url: fullUrl });
  }

  // Удаление ссылки
  if (body.action === "revoke-link" && body.linkId) {
    const success = await revokeShareLink(body.linkId, session.user.id);
    if (!success) {
      return NextResponse.json({ error: "Ссылка не найдена" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  }

  // Смена типа доступа
  if (body.action === "set-access-type") {
    if (!["PRIVATE", "LINK_ACCESS", "PUBLIC"].includes(body.accessType)) {
      return NextResponse.json({ error: "Недопустимый тип доступа" }, { status: 400 });
    }

    await prisma.file.update({
      where: { id },
      data: { accessType: body.accessType },
    });

    return NextResponse.json({ success: true, accessType: body.accessType });
  }

  return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
}
