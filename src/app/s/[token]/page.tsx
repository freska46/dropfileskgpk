"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatFileSize, formatDate, getFileCategory } from "@/lib/constants";

interface ShareFileInfo {
  file: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
    thumbnailPath: string | null;
  };
  downloads: number;
  maxDownloads: number | null;
  expiresAt: string | null;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const [info, setInfo] = useState<ShareFileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchShareInfo();
  }, [token]);

  const fetchShareInfo = async () => {
    try {
      const res = await fetch(`/api/share/${token}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ссылка недействительна");
      }
      const data = await res.json();
      setInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    window.location.href = `/api/share/${token}/download`;
    setTimeout(() => setDownloading(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="animate-pulse">Проверка ссылки...</div>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">
        <div className="text-center animate-fadeIn">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Ссылка недействительна</h1>
          <p className="text-zinc-400 mb-6">{error || "Эта ссылка истекла или была отозвана"}</p>
          <Link href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            На главную
          </Link>
        </div>
      </div>
    );
  }

  const icon = getFileCategory(info.file.mimeType);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 text-white px-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📂</div>
          <h1 className="text-xl font-bold">DropFiles<span className="text-blue-500">Kgpk</span></h1>
          <p className="text-zinc-500 text-sm mt-1">Файл готов к скачиванию</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">{info.file.thumbnailPath ? "🖼️" : icon}</div>
            <h2 className="text-lg font-semibold break-words">{info.file.originalName}</h2>
          </div>

          <div className="space-y-2 text-sm text-zinc-400 border-t border-zinc-800 pt-4">
            <div className="flex justify-between">
              <span>Размер</span>
              <span className="text-white">{formatFileSize(info.file.size)}</span>
            </div>
            <div className="flex justify-between">
              <span>Загружен</span>
              <span className="text-white">{formatDate(new Date(info.file.createdAt))}</span>
            </div>
            <div className="flex justify-between">
              <span>Тип</span>
              <span className="text-white font-mono text-xs">{info.file.mimeType}</span>
            </div>
            {info.maxDownloads && (
              <div className="flex justify-between">
                <span>Скачиваний</span>
                <span className="text-white">{info.downloads} / {info.maxDownloads}</span>
              </div>
            )}
            {info.expiresAt && (
              <div className="flex justify-between">
                <span>Истекает</span>
                <span className="text-white">{new Date(info.expiresAt).toLocaleDateString("ru-RU")}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-medium transition-colors text-lg"
        >
          {downloading ? "⏳ Скачивание..." : "⬇️ Скачать"}
        </button>

        <p className="text-center text-xs text-zinc-600 mt-4">
          Файл предоставлен пользователем DropFilesKgpk
        </p>
      </div>
    </div>
  );
}
