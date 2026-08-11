@echo off
REM ⚡ LearnXChain Frontend Performance - Quick Start Guide (Windows)
REM This script helps you verify all optimizations are working

echo ================================================
echo 🚀 LearnXChain Frontend Performance Verification
echo ================================================
echo.

REM 1. Check Node version
echo ✓ Checking Node.js version...
node --version
echo.

REM 2. Check next config
echo ✓ Verifying next.config.js...
findstr /M "swcMinify: true" next.config.js >nul 2>&1
if %errorlevel% equ 0 (
  echo   ✅ SWC minification enabled
) else (
  echo   ❌ SWC minification NOT enabled
)

findstr /M "optimizePackageImports" next.config.js >nul 2>&1
if %errorlevel% equ 0 (
  echo   ✅ Package optimization configured
) else (
  echo   ❌ Package optimization NOT configured
)

findstr /M "headers()" next.config.js >nul 2>&1
if %errorlevel% equ 0 (
  echo   ✅ Caching headers configured
) else (
  echo   ❌ Caching headers NOT configured
)
echo.

REM 3. Check performance files
echo ✓ Checking performance utilities...
if exist "lib\performance\imageOptimizer.ts" (
  echo   ✅ Image optimizer found
) else (
  echo   ❌ Image optimizer NOT found
)

if exist "lib\performance\monitoring.ts" (
  echo   ✅ Performance monitoring found
) else (
  echo   ❌ Performance monitoring NOT found
)

if exist "lib\performance\fontOptimization.ts" (
  echo   ✅ Font optimization found
) else (
  echo   ❌ Font optimization NOT found
)
echo.

REM 4. Check page optimizations
echo ✓ Checking page optimizations...
setlocal enabledelayedexpansion

for %%f in (pages\product.tsx pages\services.tsx pages\solutions.tsx pages\about.tsx pages\ai.tsx pages\resources.tsx pages\book-demo.tsx) do (
  if exist "%%f" (
    findstr /M "next/dynamic" "%%f" >nul 2>&1
    if !errorlevel! equ 0 (
      echo   ✅ %%f optimized
    ) else (
      echo   ⚠️  %%f may not be optimized
    )
  )
)
echo.

REM 5. Check documentation
echo ✓ Checking documentation...
if exist "docs\FRONTEND_PERFORMANCE_GUIDE.md" (
  echo   ✅ Frontend Performance Guide found
) else (
  echo   ❌ Frontend Performance Guide NOT found
)

if exist "docs\OPTIMIZATION_CHECKLIST.md" (
  echo   ✅ Optimization Checklist found
) else (
  echo   ❌ Optimization Checklist NOT found
)
echo.

echo ================================================
echo ✅ Verification Complete!
echo.
echo Next Steps:
echo 1. npm run build          - Build for production
echo 2. npm run start          - Test locally
echo 3. npm run lighthouse     - Run Lighthouse (if configured)
echo 4. Visit PageSpeed Insights to test online
echo.
echo Documentation:
echo - Read: docs\FRONTEND_PERFORMANCE_GUIDE.md
echo - Test: docs\OPTIMIZATION_CHECKLIST.md
echo.
pause
