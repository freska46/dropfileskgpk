@echo off
chcp 65001 >nul

if not exist ".git" (
    echo Initializing git...
    git init
    git branch -M main
)

echo Adding files...
git add -A

echo.
set /p commit="Commit message: "

git commit -m "%commit%"

echo.
echo Pushing to GitHub...
git push -u https://github.com/freska46/dropfileskgpk.git main

echo.
echo Done!
pause
