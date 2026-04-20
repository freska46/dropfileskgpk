import { prisma } from "./prisma";
import { AccessType } from "@prisma/client";

export interface AccessCheckResult {
  allowed: boolean;
  reason: "OWNER" | "PUBLIC" | "LINK_TOKEN" | "DENIED";
  file?: any;
}

/**
 * Алгоритм проверки доступа к файлу:
 *
 * 1. Если пользователь — владелец файла → ALLOWED (OWNER)
 * 2. Если accessType = PUBLIC → ALLOWED (PUBLIC)
 * 3. Если accessType = LINK_ACCESS и передан валидный токен → ALLOWED (LINK_TOKEN)
 * 4. Иначе → DENIED
 */
export async function checkFileAccess(
  fileId: string,
  userId?: string | null,
  shareToken?: string
): Promise<AccessCheckResult> {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: { shareLinks: true },
  });

  if (!file) {
    return { allowed: false, reason: "DENIED" };
  }

  // 1. Проверка владельца
  if (userId && file.userId === userId) {
    return { allowed: true, reason: "OWNER", file };
  }

  // 2. Публичный доступ
  if (file.accessType === AccessType.PUBLIC) {
    return { allowed: true, reason: "PUBLIC", file };
  }

  // 3. Доступ по ссылке (LINK_ACCESS)
  if (file.accessType === AccessType.LINK_ACCESS && shareToken) {
    const link = await prisma.shareLink.findFirst({
      where: {
        fileId,
        token: shareToken,
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          {
            OR: [
              { maxDownloads: null },
              { downloads: { lt: prisma.shareLink.fields.maxDownloads as any } },
            ],
          },
        ],
      },
    });

    if (link) {
      // Увеличиваем счётчик скачиваний
      await prisma.shareLink.update({
        where: { id: link.id },
        data: { downloads: { increment: 1 } },
      });
      return { allowed: true, reason: "LINK_TOKEN", file };
    }
  }

  // 4. Доступ запрещён
  return { allowed: false, reason: "DENIED" };
}

/**
 * Генерация секретной ссылки для файла
 */
export async function generateShareLink(
  fileId: string,
  createdById: string,
  options?: {
    expiresAt?: Date;
    maxDownloads?: number;
  }
): Promise<string> {
  const crypto = await import("crypto");
  const token = crypto.randomBytes(16).toString("hex");

  const link = await prisma.shareLink.create({
    data: {
      token,
      fileId,
      createdById,
      expiresAt: options?.expiresAt || null,
      maxDownloads: options?.maxDownloads || null,
    },
  });

  // Автоматически ставим LINK_ACCESS если файл был PRIVATE
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (file?.accessType === AccessType.PRIVATE) {
    await prisma.file.update({
      where: { id: fileId },
      data: { accessType: AccessType.LINK_ACCESS },
    });
  }

  return token;
}

/**
 * Отзыв ссылки
 */
export async function revokeShareLink(linkId: string, userId: string): Promise<boolean> {
  const link = await prisma.shareLink.findUnique({
    where: { id: linkId },
    include: { file: true },
  });

  if (!link || link.file.userId !== userId) {
    return false;
  }

  await prisma.shareLink.delete({ where: { id: linkId } });
  return true;
}

/**
 * Получение информации о файле по токену ссылки
 */
export async function getFileByShareToken(token: string) {
  const link = await prisma.shareLink.findFirst({
    where: {
      token,
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        {
          OR: [
            { maxDownloads: null },
            { downloads: { lt: prisma.shareLink.fields.maxDownloads as any } },
          ],
        },
      ],
    },
    include: { file: true },
  });

  return link;
}
