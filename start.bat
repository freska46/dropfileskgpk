@echo off
chcp 65001 >nul
echo ============================================
echo    DropFilesKgpk — Установка и запуск
echo ============================================
echo.

echo [1/5] Установка зависимостей...
call npm install
if errorlevel 1 (
    echo.
    echo ОШИБКА при установке зависимостей!
    pause
    exit /b 1
)
echo.
echo [OK] Зависимости установлены.
echo.
pause

echo [2/5] Генерация Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo.
    echo ОШИБКА при генерации Prisma!
    pause
    exit /b 1
)
echo.
echo [OK] Prisma Client сгенерирован.
echo.
pause

echo [3/5] Синхронизация базы данных...
call npx prisma db push
if errorlevel 1 (
    echo.
    echo ОШИБКА при синхронизации БД!
    pause
    exit /b 1
)
echo.
echo [OK] База данных синхронизирована.
echo.
pause

echo [4/5] Создание администратора...
call npm run seed
if errorlevel 1 (
    echo.
    echo ОШИБКА при создании админа!
    pause
    exit /b 1
)
echo.
echo [OK] Админ создан.
echo     Email: admin@dfk.local
echo     Пароль: Admin123!
echo.
pause

echo [5/5] Запуск сервера...
echo.
echo Сервер доступен: http://localhost:3000
echo Для остановки нажмите Ctrl+C
echo.
echo ============================================
echo.
call npm run dev
