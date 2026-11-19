@echo off
chcp 65001 >nul
title Code Entry
setlocal

set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PROJECT_DIR%\scripts\launch-windows.ps1" -ProjectDir "%PROJECT_DIR%"
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo.
  echo [ERRO] Nao foi possivel iniciar o Code Entry automaticamente (codigo %EXIT_CODE%^).
  echo Verifique as mensagens acima e tente novamente.
  pause
)

endlocal & exit /b %EXIT_CODE%
