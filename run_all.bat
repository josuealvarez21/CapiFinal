@echo off
echo ==========================================
echo Iniciando el ecosistema de Cápi...
echo ==========================================

:: Verificar que MySQL este activo (puerto 3306)
netstat -ano | findstr :3306 > nul
if %errorlevel% neq 0 (
    echo [ERROR] MySQL no parece estar corriendo. Por favor inicia MySQL en XAMPP.
    pause
    exit /b
)

:: Iniciar Backend en una nueva ventana
echo [+] Iniciando Backend (FastAPI)...
:: Usamos 0.0.0.0 para que sea accesible desde localhost y 127.0.0.1 sin problemas de IPv6
start "App_Capi_Backend" cmd /k "echo Servidor Backend... && cd /d %~dp0 && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Esperar un momento para que el backend suba
timeout /t 5 /nobreak > nul

:: Iniciar Frontend en una nueva ventana
echo [+] Iniciando Frontend (Next.js)...
start "App_Capi_Frontend" cmd /k "echo Servidor Frontend... && cd /d %~dp0\frontend && npm.cmd run dev"

echo.
echo ==========================================
echo SERVIDORES LANZADOS
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo ==========================================
echo.
pause
