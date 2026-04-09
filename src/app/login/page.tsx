"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2FA состояния
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorTestCode, setTwoFactorTestCode] = useState<string>();
  const [sendingCode, setSendingCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Сначала проверяем логин/пароль и нужен ли 2FA
      const res = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        return;
      }

      // Если 2FA включена
      if (data.twoFactorRequired) {
        setTwoFactorStep(true);
        await send2FACode(email);
        return;
      }

      // Обычный вход
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Неверный email или пароль");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  const send2FACode = async (emailAddress: string) => {
    setSendingCode(true);
    try {
      const res = await fetch("/api/auth/two-factor-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAddress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTwoFactorTestCode(data.testCode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingCode(false);
    }
  };

  const verify2FA = async () => {
    setError("");
    setLoading(true);

    try {
      // Проверить 2FA код
      const res = await fetch("/api/two-factor/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: twoFactorCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Код верный — входим
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Ошибка входа");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===================== 2FA ШАГ =====================
  if (twoFactorStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 text-white px-4">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-2xl font-bold">Двухфакторная аутентификация</h1>
            <p className="text-zinc-400 mt-1">Код отправлен на {email}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {twoFactorTestCode && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg p-3 text-sm">
                🔧 Тестовый код: <strong className="font-mono text-lg">{twoFactorTestCode}</strong>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Код</label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              onClick={verify2FA}
              disabled={loading || twoFactorCode.length !== 6}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              {loading ? "Проверка..." : "Войти"}
            </button>

            <button
              onClick={() => send2FACode(email)}
              disabled={sendingCode}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
            >
              {sendingCode ? "Отправка..." : "Отправить код повторно"}
            </button>

            <button
              onClick={() => { setTwoFactorStep(false); setTwoFactorCode(""); setError(""); }}
              className="w-full py-2 text-zinc-400 hover:text-white text-sm"
            >
              ← Назад к входу
            </button>
          </div>

          <p className="text-center mt-4 text-zinc-500 text-xs">
            Код действителен 5 минут
          </p>
        </div>
      </div>
    );
  }

  // ===================== ОБЫЧНЫЙ ВХОД =====================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 text-white px-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📂</div>
          <h1 className="text-2xl font-bold">DropFiles<span className="text-blue-500">Kgpk</span></h1>
          <p className="text-zinc-400 mt-1">Войдите в свой аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          {resetSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 text-sm">
              ✅ Пароль сброшен! Войдите с новым паролем.
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="text-center mt-4 text-zinc-400 text-sm">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Зарегистрируйтесь
          </Link>
        </p>

        <div className="mt-6 text-center text-xs text-zinc-600 space-x-3">
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
            Политика конфиденциальности
          </Link>
          <span>·</span>
          <Link href="/forgot-password" className="hover:text-zinc-400 transition-colors">
            Забыли пароль?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Загрузка...</div>}>
      <LoginForm />
    </Suspense>
  );
}
