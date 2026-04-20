import crypto from "crypto";
import sharp from "sharp";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, THUMBNAIL_DIR } from "./constants";
import { supabaseAdmin, BUCKET_NAME } from "./supabase";

// ===================== FILE VALIDATION =====================

export function validateFile(file: { mimetype: string; originalname: string; size: number }): {
  valid: boolean;
  error?: string;
} {
  // Проверка размера (единственное ограничение!)
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Файл слишком большой. Максимум ${MAX_FILE_SIZE / 1024 / 1024}МБ` };
  }

  // Принимаем любые файлы — без проверки типа
  return { valid: true };
}

// ===================== FILE NAME GENERATION =====================

export function generateStoredName(originalName: string): string {
  const ext = originalName.toLowerCase().split(".").pop() || "";
  return `${crypto.randomUUID()}.${ext}`;
}

// ===================== SUPABASE STORAGE PATHS =====================

export function getFilePath(userId: string, storedName: string): string {
  return `${userId}/${storedName}`;
}

export function getThumbnailPath(userId: string, storedName: string): string {
  return `${userId}/thumbnails/${storedName}.thumb.jpg`;
}

// ===================== THUMBNAIL GENERATION =====================

export async function generateThumbnail(
  fileBuffer: Buffer,
  mimeType: string,
  userId: string,
  storedName: string
): Promise<string | null> {
  try {
    if (!mimeType.startsWith("image/")) {
      return null;
    }

    const thumbnailBuffer = await sharp(fileBuffer)
      .resize(200, 200, { fit: "cover", position: "center" })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbPath = getThumbnailPath(userId, storedName);

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(thumbPath, thumbnailBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Thumbnail upload error:", error);
      return null;
    }

    return thumbPath;
  } catch {
    return null;
  }
}

// ===================== STORAGE QUOTA CHECK =====================

import { prisma } from "./prisma";
import { DEFAULT_STORAGE_LIMIT } from "./constants";

export async function checkStorageQuota(userId: string, additionalBytes: number): Promise<{
  allowed: boolean;
  used: bigint;
  limit: bigint;
  remaining: bigint;
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, used: 0n, limit: 0n, remaining: 0n };

  const storageLimit = user.storageLimit > 0n ? user.storageLimit : DEFAULT_STORAGE_LIMIT;

  // Считаем использованное место
  const files = await prisma.file.findMany({ where: { userId } });
  const used = files.reduce((sum, f) => sum + f.size, BigInt(0));
  const remaining = storageLimit - used;

  return {
    allowed: BigInt(additionalBytes) <= remaining,
    used,
    limit: storageLimit,
    remaining,
  };
}

// ===================== FILE DELETION FROM SUPABASE =====================

export async function deleteFileFromStorage(userId: string, storedName: string): Promise<void> {
  const filePath = getFilePath(userId, storedName);
  await supabaseAdmin.storage.from(BUCKET_NAME).remove([filePath]);

  // Удаляем превью
  const thumbPath = getThumbnailPath(userId, storedName);
  await supabaseAdmin.storage.from(BUCKET_NAME).remove([thumbPath]);
}
