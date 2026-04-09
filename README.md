# DropFilesKgpk (DFK) — Личный файлообменник

Полнофункциональное веб-приложение для загрузки, хранения и обмена файлами с системой аккаунтов и разграничением доступа.

## Возможности

### 👤 Пользователи
- Регистрация и авторизация (email/пароль, bcrypt + JWT через NextAuth)
- Личный кабинет с файлами и папками
- Настройки: смена имени, email, пароля, темы (тёмная/светлая)
- Квота хранилища (1 ГБ по умолчанию)

### 📂 Файлы
- Загрузка drag-and-drop или через кнопку (до 500 МБ)
- Валидация MIME-типа и расширений
- UUID-имена на диске (безопасность)
- Превью для изображений (sharp)
- Переименование, удаление, перемещение по папкам

### 🔐 Система доступа (как Google Drive)
| Тип | Описание |
|-----|----------|
| 🔒 **Приватный** | Только владелец |
| 🔗 **По ссылке** | Секретный токен, скачивание без авторизации |
| 🌐 **Публичный** | Любой человек может найти и скачать |

- Ссылки с токеном: `site.com/s/abc123def456...`
- Лимит скачиваний и срок жизни ссылки
- Отзыв ссылок в один клик

### 👨‍💼 Админ-панель
- Список всех пользователей
- Изменение лимита хранилища
- Удаление пользователей

## Стек (всё бесплатно)

| Компонент | Технология |
|-----------|-----------|
| Fullstack | Next.js 14 (App Router) |
| БД | SQLite + Prisma 6 |
| Аутентификация | NextAuth.js v5 (Auth.js) |
| Стили | TailwindCSS 3 |
| Хранение | Локальный диск (`uploads/{userId}/`) |
| Превью | Sharp |

## 🚀 Деплой в интернет (Бесплатно)

### Vercel + Supabase — полная инструкция

#### 1. Создай проект на Supabase

1. Зайди на [supabase.com](https://supabase.com), вход через GitHub
2. **New Project** → название `dropfileskgpk` → регион (близкий к тебе)
3. Скопируй данные из **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_KEY`
4. Скопируй строку подключения из **Settings → Database**:
   - `Connection string` (URI mode) → `DATABASE_URL`

#### 2. Создай Storage Bucket

1. В панели Supabase → **Storage** → **New bucket**
2. Название: `dfk-files`
3. **Public bucket** — выключено
4. В **Policies** → **New Policy** → **Full access** для `service_role`

#### 3. Залей код на GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/твой-ник/dropfileskgpk.git
git push -u origin main
```

#### 4. Подключи к Vercel

1. Зайди на [vercel.com](https://vercel.com), вход через GitHub
2. **Add New** → **Project** → импортируй репозиторий
3. **Environment Variables** — добавь всё из `.env`:
   ```
   NEXTAUTH_SECRET=сгенерируй через: npx auth secret
   NEXTAUTH_URL=https://твое-имя.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_KEY=...
   DATABASE_URL=postgresql://...
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=твоя_почта@gmail.com
   SMTP_PASS=пароль_приложения
   SMTP_FROM=DropFilesKgpk <твоя_почта@gmail.com>
   ADMIN_EMAIL=admin@dfk.local
   ADMIN_PASSWORD=Admin123!
   MAX_FILE_SIZE=524288000
   DEFAULT_STORAGE_LIMIT=1073741824
   ```
4. **Deploy** — сайт будет на `твое-имя.vercel.app`

#### 5. Push БД и создай админа

В панели Vercel → **Storage** → **Create Database** (PostgreSQL) — или используй Supabase как БД (рекомендуется).

После деплоя открой **Vercel → Dashboard → Settings → General → Build Command**:
```
npx prisma generate && npx prisma db push && npx tsx prisma/seed.ts && next build
```

### Локальный запуск (для разработки)

Для локальной разработки используется SQLite:

```bash
# 1. Переключи БД на SQLite
# В prisma/schema.prisma: provider = "sqlite"
# В .env: DATABASE_URL="file:./dev.db"

# 2. Установка
npm install
npx prisma generate
npx prisma db push
npm run seed

# 3. Запуск
npm run dev
```

> **Важно:** Для локальной разработки оставь SQLite. Для продакшена на Vercel — PostgreSQL через Supabase.

## 📧 Настройка отправки почты (SMTP)

По умолчанию коды подтверждения выводятся в консоль (режим разработки). Для реальной отправки на email настрой SMTP в `.env`:

### Вариант А: Личный Gmail (Простой)
1. Зайди в [Настройки аккаунта Google → Пароли приложений](https://myaccount.google.com/apppasswords).
2. Создай пароль для приложения "DropFilesKgpk".
3. Впиши данные в `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=твой_email@gmail.com
SMTP_PASS=твой_16значный_пароль_приложения
SMTP_FROM=DropFilesKgpk <твой_email@gmail.com>
```

### Вариант Б: Resend (Профессиональный)
Бесплатно 3000 писем/мес, выше доставляемость в Яндекс/Mail.ru.
1. Зарегистрируйся на [resend.com](https://resend.com).
2. Скопируй API Key.
3. В `.env`:

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_твой_api_key
SMTP_FROM=DropFilesKgpk <onboarding@resend.dev>
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` — регистрация
- `POST /api/auth/signin` — вход (NextAuth)
- `POST /api/auth/signout` — выход

### Файлы
- `GET /api/files` — список файлов (query: `?folderId=xxx`)
- `POST /api/files/upload` — загрузка (multipart/form-data)
- `GET /api/files/:id` — информация о файле
- `PATCH /api/files/:id` — переименование/перемещение/смена доступа
- `DELETE /api/files/:id` — удаление
- `GET /api/files/:id/download` — скачивание (с проверкой прав)
- `POST /api/files/:id/share` — управление ссылками

### Шаринг
- `GET /api/share/:token` — информация о файле по ссылке
- `GET /api/share/:token/download` — скачивание по ссылке

### Папки
- `POST /api/folders` — создать папку
- `PATCH /api/folders?id=xxx` — переименовать/переместить
- `DELETE /api/folders?id=xxx` — удалить

### Настройки
- `GET /api/settings` — получить настройки
- `PATCH /api/settings` — обновить профиль/пароль/настройки

### Админ
- `GET /api/admin` — список пользователей
- `PATCH /api/admin` — изменить лимит
- `DELETE /api/admin?userId=xxx` — удалить пользователя

## Алгоритм проверки доступа

```
checkFileAccess(fileId, userId?, shareToken?):
  1. Загрузить файл из БД
  2. Если userId === file.userId → ALLOWED (OWNER)
  3. Если file.accessType === PUBLIC → ALLOWED (PUBLIC)
  4. Если file.accessType === LINK_ACCESS И shareToken валиден:
     - Проверить срок действия (expiresAt)
     - Проверить лимит скачиваний (maxDownloads)
     - Увеличить счётчик downloads
     → ALLOWED (LINK_TOKEN)
  5. Иначе → DENIED
```

## Структура проекта

```
├── prisma/
│   ├── schema.prisma    # Схема БД
│   └── seed.ts          # Сид админа
├── src/
│   ├── app/
│   │   ├── api/          # API роуты
│   │   ├── dashboard/    # Личный кабинет
│   │   ├── settings/     # Настройки
│   │   ├── admin/        # Админка
│   │   ├── s/[token]/    # Публичная страница скачивания
│   │   ├── login/        # Вход
│   │   └── register/     # Регистрация
│   ├── components/       # React компоненты
│   ├── lib/              # Утилиты
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── access-control.ts   # Проверка доступа
│   │   ├── file-utils.ts       # Работа с файлами
│   │   └── constants.ts
│   └── middleware.ts     # Защита роутов
├── uploads/              # Файлы на диске
└── .env                  # Переменные окружения
```

## Безопасность

- ✅ Файлы переименовываются в UUID на диске
- ✅ Скачивание только через API (проверка прав)
- ✅ Валидация MIME-типа + расширения
- ✅ bcrypt хеширование паролей
- ✅ JWT сессии через NextAuth
- ✅ Квота хранилища на пользователя
- ✅ Ссылки с токеном, сроком и лимитом скачиваний

## Лицензия

MIT
