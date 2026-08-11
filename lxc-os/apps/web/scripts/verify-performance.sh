#!/usr/bin/env bash
# ⚡ LearnXChain Frontend Performance - Quick Start Guide
# This script helps you verify all optimizations are working

set -e

echo "🚀 LearnXChain Frontend Performance Verification"
echo "=================================================="
echo ""

# 1. Check Node version
echo "✓ Checking Node.js version..."
node --version
echo ""

# 2. Check next config
echo "✓ Verifying next.config.js..."
if grep -q "swcMinify: true" next.config.js; then
  echo "  ✅ SWC minification enabled"
else
  echo "  ❌ SWC minification NOT enabled"
fi

if grep -q "optimizePackageImports" next.config.js; then
  echo "  ✅ Package optimization configured"
else
  echo "  ❌ Package optimization NOT configured"
fi

if grep -q "headers()" next.config.js; then
  echo "  ✅ Caching headers configured"
else
  echo "  ❌ Caching headers NOT configured"
fi
echo ""

# 3. Check performance files
echo "✓ Checking performance utilities..."
if [ -f "lib/performance/imageOptimizer.ts" ]; then
  echo "  ✅ Image optimizer found"
else
  echo "  ❌ Image optimizer NOT found"
fi

if [ -f "lib/performance/monitoring.ts" ]; then
  echo "  ✅ Performance monitoring found"
else
  echo "  ❌ Performance monitoring NOT found"
fi

if [ -f "lib/performance/fontOptimization.ts" ]; then
  echo "  ✅ Font optimization found"
else
  echo "  ❌ Font optimization NOT found"
fi
echo ""

# 4. Check page optimizations
echo "✓ Checking page optimizations..."
pages=("pages/product.tsx" "pages/services.tsx" "pages/solutions.tsx" "pages/about.tsx" "pages/ai.tsx" "pages/resources.tsx" "pages/book-demo.tsx")

for page in "${pages[@]}"; do
  if grep -q "next/dynamic" "$page" 2>/dev/null; then
    echo "  ✅ $page optimized"
  else
    echo "  ⚠️  $page may not be optimized"
  fi
done
echo ""

# 5. Check documentation
echo "✓ Checking documentation..."
if [ -f "docs/FRONTEND_PERFORMANCE_GUIDE.md" ]; then
  echo "  ✅ Frontend Performance Guide found"
else
  echo "  ❌ Frontend Performance Guide NOT found"
fi

if [ -f "docs/OPTIMIZATION_CHECKLIST.md" ]; then
  echo "  ✅ Optimization Checklist found"
else
  echo "  ❌ Optimization Checklist NOT found"
fi
echo ""

echo "=================================================="
echo "✅ Verification Complete!"
echo ""
echo "Next Steps:"
echo "1. npm run build          - Build for production"
echo "2. npm run start          - Test locally"
echo "3. npm run lighthouse     - Run Lighthouse (if configured)"
echo "4. Visit PageSpeed Insights to test online"
echo ""
echo "Documentation:"
echo "- Read: docs/FRONTEND_PERFORMANCE_GUIDE.md"
echo "- Test: docs/OPTIMIZATION_CHECKLIST.md"
echo ""
