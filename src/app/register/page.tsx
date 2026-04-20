"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Этапы: "form" → "verify" → "done"
  const [step, setStep] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [testCode, setTestCode] = useState<string | undefined>();
  const [sendingCode, setSendingCode] = useState(false);

  // Отправить код на email
  const sendCode = async () => {
    setError("");
    setSendingCode(true);
    try {
      const res = await fetch("/api/verify-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTestCode(data.testCode);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingCode(false);
    }
  };

  // Проверить код
  const verifyCode = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Код верный → регистрируем
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, emailVerified: true }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.error);

      // Авто-вход
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Аккаунт создан. Войдите вручную.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Заполните все поля");
      return;
    }
    if (password.length < 8) {
      setError("Пароль минимум 8 символов");
      return;
    }
    if (!/[a-zA-Zа-яА-ЯёЁ]/.test(password)) {
      setError("Пароль должен содержать хотя бы одну букву");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Пароль должен содержать хотя бы одну цифру");
      return;
    }

    await sendCode();
    setStep("verify");
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 text-white px-4">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">📧</div>
            <h1 className="text-2xl font-bold">Подтверждение email</h1>
            <p className="text-zinc-400 mt-1">Код отправлен на {email}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {testCode && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg p-3 text-sm">
                🔧 Тестовый режим. Ваш код: <strong className="font-mono text-lg">{testCode}</strong>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Код подтверждения</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              onClick={verifyCode}
              disabled={loading || code.length !== 6}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              {loading ? "Проверка..." : "Подтвердить и создать аккаунт"}
            </button>

            <button
              onClick={sendCode}
              disabled={sendingCode}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
            >
              {sendingCode ? "Отправка..." : "Отправить код повторно"}
            </button>

            <button
              onClick={() => setStep("form")}
              className="w-full py-2 text-zinc-400 hover:text-white text-sm"
            >
              ← Изменить email
            </button>
          </div>

          <p className="text-center mt-4 text-zinc-500 text-xs">
            Код действителен 10 минут
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 text-white px-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📂</div>
          <h1 className="text-2xl font-bold">DropFiles<span className="text-blue-500">Kgpk</span></h1>
          <p className="text-zinc-400 mt-1">Создайте аккаунт</p>
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ваше имя"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Минимум 8 символов, буквы + цифры"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Минимум 8 символов, минимум одна буква и одна цифра
            </p>
          </div>

          <button
            type="submit"
            disabled={sendingCode}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
          >
            {sendingCode ? "Отправка кода..." : "Далее →"}
          </button>

          <p className="text-xs text-zinc-500 text-center">
            После нажатия на email придёт 6-значный код
          </p>
        </form>

        <p className="text-center mt-4 text-zinc-400 text-sm">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Войдите
          </Link>
        </p>

        <div className="mt-6 text-center text-xs text-zinc-600 space-x-3">
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </div>
  );
}
