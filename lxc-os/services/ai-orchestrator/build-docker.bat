@echo off
echo ========================================
echo LearnXChain AI Services - Build Script
echo ========================================
echo.

REM Change to ai-service directory
cd /d "%~dp0"

echo [1/5] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo Docker found!
echo.

echo [2/5] Stopping existing containers...
docker-compose down 2>nul
echo.

echo [3/5] Building AI Service Docker image...
echo This may take several minutes on first build...
docker-compose build
if errorlevel 1 (
    echo ERROR: Docker build failed
    pause
    exit /b 1
)
echo Build successful!
echo.

echo [4/5] Starting AI Services...
docker-compose up -d
if errorlevel 1 (
    echo ERROR: Failed to start services
    pause
    exit /b 1
)
echo.

echo [5/5] Waiting for services to be ready...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo AI Services are now running!
echo ========================================
echo.
echo Face Recognition Service: http://localhost:5002
echo   - Health Check: http://localhost:5002/health
echo   - API Docs: http://localhost:5002/docs
echo.
echo Timetable AI Service: http://localhost:8000
echo   - Health Check: http://localhost:8000/health
echo   - API Docs: http://localhost:8000/docs
echo.
echo To view logs: docker-compose logs -f
echo To stop services: docker-compose down
echo ========================================
echo.

REM Optional: Open health check URLs in browser
set /p OPEN="Open health check pages in browser? (y/n): "
if /i "%OPEN%"=="y" (
    start http://localhost:5002/health
    start http://localhost:8000/health
)

pause
