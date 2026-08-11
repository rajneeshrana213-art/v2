-- ============================================================================
-- INDEX VERIFICATION QUERY
-- ============================================================================
-- Run this in your PostgreSQL client after running the migration
-- This verifies that all performance indexes were created correctly
-- ============================================================================

-- Check indexes on GlobalSetting table
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'GlobalSetting' 
AND indexname NOT LIKE 'GlobalSetting_pkey'
ORDER BY indexname;

-- Check indexes on School table
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'School' 
AND indexname NOT LIKE 'School_pkey'
ORDER BY indexname;

-- Check indexes on subscription table (note: lowercase in some databases)
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'subscription' 
AND indexname NOT LIKE 'subscription_pkey'
ORDER BY indexname;

-- Check indexes on User table
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'User' 
AND indexname NOT LIKE 'User_pkey'
ORDER BY indexname;

-- Count total indexes per table
SELECT 
  tablename,
  COUNT(*) as index_count
FROM pg_indexes 
WHERE tablename IN ('GlobalSetting', 'School', 'subscription', 'User')
AND indexname NOT LIKE '%_pkey'
GROUP BY tablename
ORDER BY tablename;

-- Check index size (shows if indexes are being used/taking space)
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes 
WHERE tablename IN ('GlobalSetting', 'School', 'subscription', 'User')
ORDER BY pg_relation_size(indexrelid) DESC;

-- Analyze index usage (run after applying migration and some traffic)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_usage_count,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename IN ('GlobalSetting', 'School', 'subscription', 'User')
ORDER BY idx_scan DESC;

-- Get table statistics (should be up-to-date after migration)
SELECT 
  schemaname,
  tablename,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables 
WHERE tablename IN ('GlobalSetting', 'School', 'subscription', 'User')
ORDER BY n_live_tup DESC;

-- ============================================================================
-- EXPECTED OUTPUT AFTER OPTIMIZATION
-- ============================================================================
-- You should see:
-- 1. GlobalSetting: ~2 new indexes
-- 2. School: ~8 new indexes  
-- 3. subscription: ~10 new indexes
-- 4. User: ~7 new indexes
-- 
-- If you don't see these indexes, the migration may not have applied.
-- Run: npx prisma migrate status
-- ============================================================================

-- ============================================================================
-- PERFORMANCE TEST QUERIES
-- ============================================================================
-- Run these BEFORE and AFTER applying optimizations
-- to see the speed improvement

-- TEST 1: Global Settings Lookup (should be < 50ms)
EXPLAIN ANALYZE
SELECT * FROM GlobalSetting WHERE "group" = 'system';

-- TEST 2: School List (should be < 100ms)
EXPLAIN ANALYZE
SELECT * FROM School 
WHERE "isDeleted" = false 
AND "isActive" = true 
ORDER BY "createdAt" DESC 
LIMIT 20;

-- TEST 3: Subscription Lookup (should be < 50ms)
EXPLAIN ANALYZE
SELECT * FROM subscription 
WHERE "schoolId" = 1 
AND status = 'active';

-- TEST 4: User Count by School (should be < 30ms)
EXPLAIN ANALYZE
SELECT "schoolId", COUNT(*) as user_count
FROM User 
GROUP BY "schoolId" 
ORDER BY user_count DESC 
LIMIT 100;

-- TEST 5: School with User Count (should be < 100ms)
EXPLAIN ANALYZE
SELECT s.id, s."schoolName", COUNT(u.id) as user_count
FROM School s 
LEFT JOIN User u ON s.id = u."schoolId" 
WHERE s."isDeleted" = false 
GROUP BY s.id, s."schoolName" 
ORDER BY s."createdAt" DESC 
LIMIT 20;

-- ============================================================================
-- QUERY EXECUTION TIME COMPARISON
-- ============================================================================
-- Use TIMING to see actual execution time:

SET TIMING on;

-- Run your queries here
SELECT * FROM GlobalSetting WHERE "group" = 'system';

-- This will show:
-- Execution time: X.XXX ms
-- 
-- BEFORE optimization: ~1900ms
-- AFTER optimization:  ~50ms (or faster)

SET TIMING off;
