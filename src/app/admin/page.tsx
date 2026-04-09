"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { formatFileSize } from "@/lib/constants";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  storageLimit: string;
  createdAt: string;
  _count: { files: number };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingLimit, setEditingLimit] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users);
    } catch {
      setError("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  const updateLimit = async (userId: string) => {
    try {
      const bytes = parseFloat(newLimit) * 1024 * 1024 * 1024;
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, storageLimit: Math.floor(bytes) }),
      });
      if (!res.ok) throw new Error();
      setEditingLimit(null);
      fetchUsers();
    } catch {
      setError("Ошибка обновления лимита");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Удалить пользователя и все его файлы?")) return;
    try {
      const res = await fetch(`/api/admin?userId=${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchUsers();
    } catch {
      setError("Ошибка удаления");
    }
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Загрузка...</div>;
  }

  if (session?.user?.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold">
            📂 DropFiles<span className="text-blue-500">Kgpk</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/dashboard" className="px-3 py-1.5 text-sm hover:bg-zinc-800 rounded-lg">
              Файлы
            </Link>
            <Link href="/settings" className="px-3 py-1.5 text-sm hover:bg-zinc-800 rounded-lg">
              Настройки
            </Link>
            <span className="text-sm text-yellow-400">Админка</span>
            <button onClick={toggleTheme} className="p-2 hover:bg-zinc-800 rounded-lg">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3">{error}</div>}

        <h1 className="text-2xl font-bold mb-6">👥 Пользователи ({users.length})</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800/50 text-zinc-400">
                <tr>
                  <th className="text-left px-4 py-3">Имя</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Роль</th>
                  <th className="text-left px-4 py-3">Файлы</th>
                  <th className="text-left px-4 py-3">Лимит</th>
                  <th className="text-left px-4 py-3">Создан</th>
                  <th className="text-left px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3">{user.name || "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        user.role === "ADMIN" ? "bg-yellow-500/20 text-yellow-400" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{user._count.files}</td>
                    <td className="px-4 py-3">
                      {editingLimit === user.id ? (
                        <div className="flex gap-1">
                          <input
                            type="number"
                            value={newLimit}
                            onChange={(e) => setNewLimit(e.target.value)}
                            className="w-20 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs"
                            placeholder="GB"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && updateLimit(user.id)}
                          />
                          <button onClick={() => updateLimit(user.id)} className="px-2 py-1 bg-blue-600 rounded text-xs">✓</button>
                          <button onClick={() => setEditingLimit(null)} className="px-2 py-1 bg-zinc-800 rounded text-xs">×</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingLimit(user.id);
                            setNewLimit(String(parseInt(user.storageLimit) / 1024 / 1024 / 1024));
                          }}
                          className="text-blue-400 hover:underline"
                        >
                          {formatFileSize(BigInt(user.storageLimit))}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{new Date(user.createdAt).toLocaleDateString("ru-RU")}</td>
                    <td className="px-4 py-3">
                      {user.role !== "ADMIN" && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Удалить
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
