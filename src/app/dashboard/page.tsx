"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useEffect } from "react";
import FileDashboard from "@/components/FileDashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-pulse text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!session) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 hover:bg-zinc-800 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
            <Link href="/dashboard" className="text-lg font-bold">
              📂 DropFiles<span className="text-blue-500">Kgpk</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="px-3 py-1.5 text-sm hover:bg-zinc-800 rounded-lg transition-colors">
              Файлы
            </Link>
            <Link href="/settings" className="px-3 py-1.5 text-sm hover:bg-zinc-800 rounded-lg transition-colors">
              Настройки
            </Link>
            {session.user.role === "ADMIN" && (
              <Link href="/admin" className="px-3 py-1.5 text-sm hover:bg-zinc-800 rounded-lg transition-colors text-yellow-400">
                Админка
              </Link>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <span className="text-sm text-zinc-400">{session.user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                Выход
              </button>
            </form>
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-900 px-4 py-3 space-y-2 animate-fadeIn">
            <Link href="/dashboard" className="block px-3 py-2 hover:bg-zinc-800 rounded-lg">
              Файлы
            </Link>
            <Link href="/settings" className="block px-3 py-2 hover:bg-zinc-800 rounded-lg">
              Настройки
            </Link>
            {session.user.role === "ADMIN" && (
              <Link href="/admin" className="block px-3 py-2 hover:bg-zinc-800 rounded-lg text-yellow-400">
                Админка
              </Link>
            )}
            <button
              onClick={toggleTheme}
              className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded-lg"
            >
              {theme === "dark" ? "☀️ Светлая тема" : "🌙 Тёмная тема"}
            </button>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded-lg">
                Выход
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <FileDashboard />
      </main>
    </div>
  );
}
