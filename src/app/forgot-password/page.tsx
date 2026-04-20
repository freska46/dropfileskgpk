"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Этапы: "email" → "reset"
  const [step, setStep] = useState<"email" | "reset">("email");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [testCode, setTestCode] = useState<string>();
  const [sendingCode, setSendingCode] = useState(false);

  const sendCode = async () => {
    setError("");
    setSendingCode(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTestCode(data.testCode);
      setStep("reset");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Введите email");
      return;
    }

    await sendCode();
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (newPassword.length < 8) {
      setError("Пароль минимум 8 символов");
      setLoading(false);
      return;
    }
    if (!/[a-zA-Zа-яА-ЯёЁ]/.test(newPassword)) {
      setError("Пароль должен содержать хотя бы одну букву");
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("Пароль должен содержать хотя бы одну цифру");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Успех — перенаправляем на вход
      router.push("/login?reset=success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===================== ЭТАП 1: ВВОД EMAIL =====================
  if (step === "email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 text-white px-4">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🔑</div>
            <h1 className="text-2xl font-bold">Восстановление пароля</h1>
            <p className="text-zinc-400 mt-1">Введите email, привязанный к аккаунту</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
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
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={sendingCode}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              {sendingCode ? "Отправка..." : "Отправить код"}
            </button>
          </form>

          <p className="text-center mt-4 text-zinc-400 text-sm">
            Вспомнили пароль?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ===================== ЭТАП 2: КОД + НОВЫЙ ПАРОЛЬ =====================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 text-white px-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold">Новый пароль</h1>
          <p className="text-zinc-400 mt-1">Код отправлен на {email}</p>
        </div>

        <form onSubmit={resetPassword} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {testCode && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg p-3 text-sm">
              🔧 Тестовый код: <strong className="font-mono text-lg">{testCode}</strong>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Код из письма</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="000000"
              maxLength={6}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Минимум 8 символов, буквы + цифры"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-zinc-500 mt-1">Минимум 8 символов, одна буква и одна цифра</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Подтвердите пароль</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Повторите пароль"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
          >
            {loading ? "Сохранение..." : "Сбросить пароль"}
          </button>

          <button
            type="button"
            onClick={sendCode}
            disabled={sendingCode}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
          >
            {sendingCode ? "Отправка..." : "Отправить код повторно"}
          </button>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="w-full py-2 text-zinc-400 hover:text-white text-sm"
          >
            ← Изменить email
          </button>
        </form>

        <p className="text-center mt-4 text-zinc-500 text-xs">
          Код действителен 10 минут
        </p>
      </div>
    </div>
  );
}
