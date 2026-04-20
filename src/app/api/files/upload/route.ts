import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  validateFile,
  generateStoredName,
  checkStorageQuota,
  generateThumbnail,
  getFilePath,
} from "@/lib/file-utils";
import { supabaseAdmin, BUCKET_NAME } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Парсим multipart
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderId = formData.get("folderId") as string | undefined;

    if (!file) {
      return NextResponse.json({ error: "Нет файла" }, { status: 400 });
    }

    // Конвертируем в нужный формат
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || "unknown";
    const mimeType = file.type || "application/octet-stream";
    const fileSize = fileBuffer.length;

    // Валидация файла
    const validation = validateFile({
      mimetype: mimeType,
      originalname: fileName,
      size: fileSize,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Проверка квоты
    const quota = await checkStorageQuota(userId, fileSize);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Превышен лимит хранилища. Доступно: ${(Number(quota.remaining) / 1024 / 1024).toFixed(1)}МБ`,
        },
        { status: 413 }
      );
    }

    // Генерация безопасного имени
    const storedName = generateStoredName(fileName);
    const filePath = getFilePath(userId, storedName);

    // Загрузка в Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Ошибка загрузки на сервер" }, { status: 500 });
    }

    // Генерация превью
    const thumbnailPath = await generateThumbnail(fileBuffer, mimeType, userId, storedName);

    // Запись в БД
    const dbFile = await prisma.file.create({
      data: {
        originalName: fileName,
        storedName,
        mimeType,
        size: BigInt(fileSize),
        userId,
        folderId: folderId || null,
        thumbnailPath,
      },
    });

    return NextResponse.json({
      file: {
        id: dbFile.id,
        originalName: dbFile.originalName,
        mimeType: dbFile.mimeType,
        size: Number(dbFile.size),
        createdAt: dbFile.createdAt,
        accessType: dbFile.accessType,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}
