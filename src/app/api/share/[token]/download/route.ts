import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFileByShareToken } from "@/lib/access-control";
import { supabaseAdmin, BUCKET_NAME } from "@/lib/supabase";
import { getFilePath } from "@/lib/file-utils";

// GET — скачивание файла по секретной ссылке
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const link = await getFileByShareToken(token);

  if (!link) {
    return NextResponse.json(
      { error: "Ссылка недействительна или истекла" },
      { status: 404 }
    );
  }

  const file = link.file;
  const filePath = getFilePath(file.userId, file.storedName);

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error || !data) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  const contentType = file.mimeType || "application/octet-stream";
  const inlineTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
  const disposition = inlineTypes.includes(contentType) ? "inline" : "attachment";

  const headers = new Headers({
    "Content-Disposition": `${disposition}; filename="${encodeURIComponent(file.originalName)}"`,
    "Content-Type": contentType,
  });

  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  headers.set("Content-Length", String(buffer.length));

  return new NextResponse(buffer, { headers });
}
