@echo off
chcp 65001 >nul
echo Generating Prisma Client...
call npx prisma generate

echo.
echo Pushing database schema...
call npx prisma db push

echo.
echo Seeding database...
call npm run seed

echo.
echo Database ready!
echo Admin: admin@dfk.local
echo Password: Admin123!
pause
