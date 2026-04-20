"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatFileSize, formatDate, getFileCategory, getFileIconByExtension } from "@/lib/constants";

interface PublicFileInfo {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  thumbnailPath: string | null;
  accessType: string;
  user: {
    name: string;
    email: string;
  };
}

export default function PublicFilePage() {
  const params = useParams();
  const fileId = params.id as string;
  const [file, setFile] = useState<PublicFileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchFile();
  }, [fileId]);

  const fetchFile = async () => {
    try {
      const res = await fetch(`/api/files/${fileId}`);
      if (!res.ok) throw new Error("Файл не найден или недоступен");
      const data = await res.json();

      if (data.file.accessType !== "PUBLIC") {
        setError("Этот файл не является публичным");
        setLoading(false);
        return;
      }

      setFile({
        ...data.file,
        user: data.file.user || { name: "Аноним", email: "" },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    window.location.href = `/api/files/${fileId}/download`;
    setTimeout(() => setDownloading(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">
        <div className="text-center animate-fadeIn">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Файл недоступен</h1>
          <p className="text-zinc-400 mb-6">{error || "Файл не найден"}</p>
          <Link href="/public" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            ← К публичным файлам
          </Link>
        </div>
      </div>
    );
  }

  const isImage = file.mimeType.startsWith("image/");
  const isUnknownType = file.mimeType === "application/octet-stream" || !file.mimeType;
  const icon = isUnknownType ? getFileIconByExtension(file.originalName) : getFileCategory(file.mimeType);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white px-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📂</div>
          <h1 className="text-xl font-bold">
            DropFiles<span className="text-blue-500">Kgpk</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Публичный файл</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">
          {/* File preview */}
          <div className="h-40 bg-zinc-800/50 rounded-lg flex items-center justify-center mb-4">
            {isImage ? (
              <img
                src={`/api/files/${file.id}/download`}
                alt={file.originalName}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-5xl">{icon}</div>
            )}
          </div>

          <h2 className="text-lg font-semibold break-words mb-1">{file.originalName}</h2>

          {/* File info */}
          <div className="space-y-2 text-sm text-zinc-400 border-t border-zinc-800 pt-4 mt-4">
            <div className="flex justify-between">
              <span>Размер</span>
              <span className="text-white">{formatFileSize(file.size)}</span>
            </div>
            <div className="flex justify-between">
              <span>Загружен</span>
              <span className="text-white">{formatDate(new Date(file.createdAt))}</span>
            </div>
            <div className="flex justify-between">
              <span>Тип</span>
              <span className="text-white font-mono text-xs">{file.mimeType}</span>
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
            <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center text-sm text-blue-400 font-bold">
              {file.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm text-zinc-300">{file.user.name || file.user.email.split("@")[0]}</div>
              <div className="text-xs text-zinc-500">Автор публикации</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-medium transition-colors text-lg"
        >
          {downloading ? "⏳ Скачивание..." : "⬇️ Скачать"}
        </button>

        <div className="text-center mt-4">
          <Link href="/public" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Все публичные файлы
          </Link>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">
          Файл предоставлен пользователем DropFilesKgpk
        </p>
      </div>
    </div>
  );
}
