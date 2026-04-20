import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkFileAccess } from "@/lib/access-control";
import { supabaseAdmin, BUCKET_NAME } from "@/lib/supabase";
import { getFilePath } from "@/lib/file-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const shareToken = searchParams.get("token") || undefined;
  const force = searchParams.get("force") === "true";

  const access = await checkFileAccess(id, session?.user?.id || null, shareToken);

  if (!access.allowed) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const file = access.file!;
  const filePath = getFilePath(file.userId, file.storedName);

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error || !data) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  const fileName = file.originalName;
  const contentType = file.mimeType || "application/octet-stream";
  
  const inlineTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
  const disposition = force || !inlineTypes.includes(contentType) ? "attachment" : "inline";

  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const headers = new Headers({
    "Content-Disposition": `${disposition}; filename="${encodeURIComponent(fileName)}"`,
    "Content-Type": contentType,
    "Content-Length": String(buffer.length),
    "Cache-Control": "public, max-age=3600",
  });

  return new NextResponse(buffer, { headers });
}