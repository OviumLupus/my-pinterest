@echo off
cd /d "%~dp0"
git add images/*
git commit -m "new renders"
git push
echo.
echo ✅ Картинки загружены!
pause