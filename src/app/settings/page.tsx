"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import { useTheme } from "@/components/ThemeProvider";

interface UserSettings {
  id: string;
  email: string;
  name: string;
  role: string;
  storageLimit: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  settings: {
    theme: string;
    emailNotifs: boolean;
    language: string;
  } | null;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [user, setUser] = useState<UserSettings | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Профиль обновлён");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (newPassword.length < 8) {
      toast.error("Пароль минимум 8 символов");
      setLoading(false);
      return;
    }
    if (!/[a-zA-Zа-яА-ЯёЁ]/.test(newPassword)) {
      toast.error("Пароль должен содержать хотя бы одну букву");
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      toast.error("Пароль должен содержать хотя бы одну цифру");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Пароль изменён");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center text-white">Загрузка...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold">
            📂 DropFiles<span className="text-blue-500">Kgpk</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/dashboard" className="px-3 py-1.5 text-sm hover:bg-zinc-800 rounded-lg">
              Файлы
            </Link>
            <span className="text-sm text-blue-400">Настройки</span>
            <button onClick={toggleTheme} className="p-2 hover:bg-zinc-800 rounded-lg">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3">{error}</div>}

        {/* Profile */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">👤 Профиль</h2>
          <form onSubmit={updateProfile} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm"
            >
              Сохранить
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">🔑 Смена пароля</h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Текущий пароль</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Новый пароль</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Минимум 8 символов, буквы + цифры"
                required
                minLength={8}
              />
              <p className="text-xs text-zinc-600 mt-1">Минимум 8 символов, одна буква и одна цифра</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm"
            >
              Изменить пароль
            </button>
          </form>
        </div>

        {/* 2FA */}
        <TwoFactorSection user={user} onSuccess={() => fetchSettings()} />

        {/* Preferences */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">⚙️ Настройки</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Тема</span>
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
              >
                {theme === "dark" ? "🌙 Тёмная" : "☀️ Светлая"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Роль</span>
              <span className="text-sm text-zinc-500">{user?.role === "ADMIN" ? "Администратор" : "Пользователь"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Аккаунт создан</span>
              <span className="text-sm text-zinc-500">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("ru-RU") : ""}</span>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-zinc-900 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2 text-red-400">⚠️ Опасная зона</h2>
          <p className="text-sm text-zinc-500 mb-4">Удаление аккаунта необратимо. Все файлы будут удалены.</p>
          <button
            onClick={() => alert("Функция удаления аккаунта в разработке")}
            className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg text-sm"
          >
            Удалить аккаунт
          </button>
        </div>
      </main>
    </div>
  );
}

// ===================== 2FA SECTION =====================

function TwoFactorSection({ user, onSuccess }: { user: UserSettings | null; onSuccess: () => void }) {
  const toast = useToast();
  const [enabled, setEnabled] = useState(user?.twoFactorEnabled || false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [testCode, setTestCode] = useState<string>();

  const toggle2FA = async () => {
    if (enabled) {
      setLoading(true);
      try {
        const res = await fetch("/api/two-factor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: false }),
        });
        if (!res.ok) throw new Error();
        setEnabled(false);
        toast.success("2FA отключена");
        onSuccess();
      } catch {
        toast.error("Ошибка отключения 2FA");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const res = await fetch("/api/two-factor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTestCode(data.testCode);
        setVerifying(true);
        toast.info("Код отправлен на email");
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const confirmEnableSimple = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const res = await fetch("/api/two-factor/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const res2 = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twoFactorEnabled: true }),
      });
      if (!res2.ok) throw new Error();

      setEnabled(true);
      setVerifying(false);
      setCode("");
      setTestCode(undefined);
      toast.success("2FA включена!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">🔐 Двухфакторная аутентификация</h2>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-zinc-300">
            {enabled ? "Включена" : "Отключена"}
          </p>
          <p className="text-xs text-zinc-500">
            {enabled
              ? "При каждом входе потребуется код из email"
              : "Рекомендуется для дополнительной защиты"}
          </p>
        </div>
        {!verifying && (
          <button
            onClick={toggle2FA}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              enabled
                ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } disabled:opacity-50`}
          >
            {loading ? "..." : enabled ? "Отключить" : "Включить"}
          </button>
        )}
      </div>

      {verifying && (
        <div className="space-y-3 animate-fadeIn">
          {testCode && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg p-3 text-sm">
              🔧 Тестовый код: <strong className="font-mono text-lg">{testCode}</strong>
            </div>
          )}
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="000000"
            maxLength={6}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={confirmEnableSimple}
              disabled={loading || code.length !== 6}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm"
            >
              Подтвердить
            </button>
            <button
              onClick={() => { setVerifying(false); setCode(""); setTestCode(undefined); }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
