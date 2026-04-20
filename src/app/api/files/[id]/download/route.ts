import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkFileAccess } from "@/lib/access-control";
import { supabaseAdmin, BUCKET_NAME } from "@/lib/supabase";
import { getFilePath } from "@/lib/file-utils";

// GET — скачивание файла
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const shareToken = searchParams.get("token") || undefined;

  // Проверка доступа
  const access = await checkFileAccess(id, session?.user?.id || null, shareToken);

  if (!access.allowed) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const file = access.file!;
  const filePath = getFilePath(file.userId, file.storedName);

  // Получаем файл из Supabase
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error || !data) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  const fileName = file.originalName;
  const contentType = file.mimeType || "application/octet-stream";
  const inlineTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
  const disposition = inlineTypes.includes(contentType) ? "inline" : "attachment";

  const headers = new Headers({
    "Content-Disposition": `${disposition}; filename="${encodeURIComponent(fileName)}"`,
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=3600",
  });

  // Конвертируем Blob в буфер
  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  headers.set("Content-Length", String(buffer.length));

  return new NextResponse(buffer, { headers });
}
