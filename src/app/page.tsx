import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      <div className="max-w-2xl mx-auto text-center px-4 animate-fadeIn">
        <div className="text-6xl mb-6">📂</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          DropFiles<span className="text-blue-500">Kgpk</span>
        </h1>
        <p className="text-xl text-zinc-400 mb-8">
          Личный файлообменник. Загружайте, храните и делитесь файлами безопасно.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors border border-zinc-700"
          >
            Регистрация
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-6 text-sm text-zinc-500">
          <div>
            <div className="text-2xl mb-1">🔒</div>
            <div>Приватные файлы</div>
          </div>
          <div>
            <div className="text-2xl mb-1">🔗</div>
            <div>Секретные ссылки</div>
          </div>
          <div>
            <div className="text-2xl mb-1">🌐</div>
            <div>Публичный доступ</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} DropFilesKgpk</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
