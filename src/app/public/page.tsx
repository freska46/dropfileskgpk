"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { formatFileSize, formatDate, getFileCategory, getFileIconByExtension } from "@/lib/constants";

interface PublicFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  thumbnailPath: string | null;
  authorName: string;
}

export default function PublicFeedPage() {
  const { theme, toggleTheme } = useTheme();
  const [files, setFiles] = useState<PublicFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFiles = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public-files?page=${pageNum}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (pageNum === 1) {
        setFiles(data.files);
      } else {
        setFiles((prev) => [...prev, ...data.files]);
      }
      setHasMore(data.hasMore);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles(1);
  }, [fetchFiles]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFiles(nextPage);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold">
              📂 DropFiles<span className="text-blue-500">Kgpk</span>
            </Link>
            <span className="text-sm text-zinc-500">|</span>
            <span className="text-sm text-blue-400">Публичная лента</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Войти
            </Link>
            <Link href="/register" className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              Регистрация
            </Link>
            <button onClick={toggleTheme} className="p-2 hover:bg-zinc-800 rounded-lg">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">🌐 Публичные файлы</h1>
          <p className="text-zinc-400">Файлы, которыми поделились пользователи</p>
        </div>

        {/* Feed */}
        {files.length > 0 ? (
          <div className="space-y-4">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fadeIn">
            <div className="text-5xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold text-zinc-300 mb-2">Пока нет публичных файлов</h3>
            <p className="text-zinc-500">Зарегистрируйтесь и поделитесь первым!</p>
          </div>
        )}

        {/* Load more */}
        {hasMore && files.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
            >
              {loading ? "Загрузка..." : "Загрузить ещё"}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} DropFilesKgpk</span>
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
            Политика конфиденциальности
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ===================== FILE CARD =====================

function FileCard({ file }: { file: PublicFile }) {
  const isImage = file.mimeType.startsWith("image/");
  const isUnknownType = file.mimeType === "application/octet-stream" || !file.mimeType;
  const icon = isUnknownType ? getFileIconByExtension(file.originalName) : getFileCategory(file.mimeType);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors animate-fadeIn">
      <div className="flex items-stretch">
        {/* Thumbnail / Icon */}
        <div className="w-28 h-28 bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
          <div className="text-4xl">{isImage ? "🖼️" : icon}</div>
        </div>

        {/* Info */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="font-medium truncate mb-1" title={file.originalName}>
              {file.originalName}
            </div>
            <div className="text-xs text-zinc-500">
              {formatFileSize(file.size)} · {formatDate(new Date(file.createdAt))}
            </div>
          </div>

          {/* Author + Download */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center text-xs text-blue-400 font-bold">
                {file.authorName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-zinc-400">{file.authorName}</span>
            </div>
            <a
              href={`/f/${file.id}`}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition-colors"
            >
              👁️ Просмотр
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
