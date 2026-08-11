# Performance Optimization: Database Migration Guide (PowerShell)

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "LearnXChain Performance Optimization" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check database connection
Write-Host "Step 1: Verifying Prisma configuration..." -ForegroundColor Yellow
npx prisma validate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma configuration is invalid. Please check your DATABASE_URL." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prisma configuration is valid" -ForegroundColor Green
Write-Host ""

# Step 2: Check schema status
Write-Host "Step 2: Checking schema status..." -ForegroundColor Yellow
Write-Host "Current schema file: prisma/schema.prisma" -ForegroundColor White
Write-Host ""

# Step 3: Create migration
Write-Host "Step 3: Creating database migration..." -ForegroundColor Yellow
Write-Host "This will add performance indexes to:" -ForegroundColor White
Write-Host "  - GlobalSetting (group, group+createdAt)" -ForegroundColor White
Write-Host "  - School (isActive, isDeleted, createdAt, schoolName, schoolCode, composite indexes)" -ForegroundColor White
Write-Host "  - subscription (planId, paymentId, improved composites)" -ForegroundColor White
Write-Host ""

# Check if we need to resolve drift
Write-Host "Checking for schema drift..." -ForegroundColor Yellow
$driftCheck = npx prisma migrate status 2>&1 | Select-String -Pattern "drift|diverged"

if ($driftCheck) {
    Write-Host "⚠️  Schema drift detected" -ForegroundColor Red
    Write-Host "Run one of the following:" -ForegroundColor Yellow
    Write-Host "  1. npx prisma migrate resolve --rolled-back add_performance_indexes" -ForegroundColor White
    Write-Host "  2. npx prisma migrate reset (for development databases only)" -ForegroundColor White
    exit 1
}

# Run migration
Write-Host "Running: npx prisma migrate dev --name add_performance_indexes" -ForegroundColor Cyan
npx prisma migrate dev --name add_performance_indexes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "✅ Migration Completed Successfully!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database performance indexes have been applied." -ForegroundColor Green
    Write-Host "Global settings caching is enabled in the API." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Restart your Node.js application" -ForegroundColor White
    Write-Host "  2. Monitor logs for performance improvements" -ForegroundColor White
    Write-Host "  3. Check PERFORMANCE_OPTIMIZATION.md for details" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Red
    Write-Host "❌ Migration Failed" -ForegroundColor Red
    Write-Host "======================================" -ForegroundColor Red
    Write-Host "Please review the error above and try again." -ForegroundColor Red
    exit 1
}
