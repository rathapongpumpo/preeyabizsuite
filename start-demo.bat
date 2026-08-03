@echo off
setlocal
cd /d "%~dp0"

set "PHP_EXE="
where php >nul 2>&1
if not errorlevel 1 set "PHP_EXE=php"
if not defined PHP_EXE if exist "C:\php8\php.exe" set "PHP_EXE=C:\php8\php.exe"

if not defined PHP_EXE (
  echo [ERROR] PHP was not found.
  echo Install PHP 8.2 or newer, then add php.exe to PATH.
  pause
  exit /b 1
)

netstat -ano | findstr /R /C:":8080 .*LISTENING" >nul
if not errorlevel 1 (
  echo A server is already running on port 8080.
  echo Opening http://127.0.0.1:8080/
  start "" "http://127.0.0.1:8080/"
  timeout /t 2 >nul
  exit /b 0
)

echo Starting PreeyaBizSuite PHP Demo...
echo URL: http://127.0.0.1:8080/
start "" "http://127.0.0.1:8080/"
"%PHP_EXE%" -S 127.0.0.1:8080 -t public router.php

echo.
echo Server stopped.
pause
