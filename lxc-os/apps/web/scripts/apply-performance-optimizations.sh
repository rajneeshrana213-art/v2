#!/bin/bash
# Performance Optimization: Database Migration Guide

echo "======================================"
echo "LearnXChain Performance Optimization"
echo "======================================"
echo ""

# Step 1: Check database connection
echo "Step 1: Verifying Prisma configuration..."
npx prisma validate

if [ $? -ne 0 ]; then
    echo "❌ Prisma configuration is invalid. Please check your DATABASE_URL."
    exit 1
fi

echo "✅ Prisma configuration is valid"
echo ""

# Step 2: Check schema status
echo "Step 2: Checking schema status..."
echo "Current schema file: prisma/schema.prisma"
echo ""

# Step 3: Create migration
echo "Step 3: Creating database migration..."
echo "This will add performance indexes to:"
echo "  - GlobalSetting (group, group+createdAt)"
echo "  - School (isActive, isDeleted, createdAt, schoolName, schoolCode, composite indexes)"
echo "  - subscription (planId, paymentId, improved composites)"
echo ""

# Check if we need to resolve drift
echo "Checking for schema drift..."
DRIFT_CHECK=$(npx prisma migrate status 2>&1 | grep -i "drift\|diverged" || echo "")

if [ -n "$DRIFT_CHECK" ]; then
    echo "⚠️  Schema drift detected"
    echo "Run one of the following:"
    echo "  1. npx prisma migrate resolve --rolled-back add_performance_indexes"
    echo "  2. npx prisma migrate reset (for development databases only)"
    exit 1
fi

# Run migration
echo "Running: npx prisma migrate dev --name add_performance_indexes"
npx prisma migrate dev --name add_performance_indexes

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "✅ Migration Completed Successfully!"
    echo "======================================"
    echo ""
    echo "Database performance indexes have been applied."
    echo "Global settings caching is enabled in the API."
    echo ""
    echo "Next steps:"
    echo "  1. Restart your Node.js application"
    echo "  2. Monitor logs for performance improvements"
    echo "  3. Check PERFORMANCE_OPTIMIZATION.md for details"
    echo ""
else
    echo ""
    echo "======================================"
    echo "❌ Migration Failed"
    echo "======================================"
    echo "Please review the error above and try again."
    exit 1
fi
