# Vite Migration Testing Guide

This document outlines the testing workflow for validating the Vite migration for Tiny Tiny RSS.

## Overview

Testing is divided into:
1. **Build Tests** - Verify Vite build works correctly
2. **Dev Server Tests** - Verify development mode works
3. **Functional Tests** - Verify application functionality
4. **Regression Tests** - Ensure no regressions vs legacy build
5. **Performance Tests** - Compare build/dev speed

---

## 1. Build Tests

### 1.1 Clean Build Test

```bash
# Clean previous builds
rm -rf dist node_modules/.vite

# Install fresh dependencies
npm install

# Run production build
npm run build

# Verify build output
ls -la dist/
```

**Expected Results:**
- Build completes without errors
- `dist/` directory contains bundled assets
- `dist/index.html` is generated

### 1.2 Development Build Test

```bash
# Clean and reinstall
rm -rf node_modules/.vite
npm install

# Test dev mode starts (with timeout)
timeout 10 npm run dev

# Check for warnings/errors in output
```

**Expected Results:**
- Dev server starts on port 5173
- No ERROR-level console messages
- optimizeDeps warnings are acceptable (missing optional modules)

### 1.3 Less Compilation Test

```bash
# Test LESS to CSS compilation
npm run less

# Verify CSS files are generated
ls -la themes/*.css
```

---

## 2. Dev Server Tests

### 2.1 Basic Dev Server Test

```bash
# Start dev server in background
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Test server responds
curl -s http://localhost:5173 | head -20

# Kill dev server
kill $DEV_PID
```

### 2.2 Proxy Test

```bash
# Start dev server
npm run dev &
DEV_PID=$!

# Start PHP backend (mock)
php -S localhost:8080 -t . &
PHP_PID=$!

sleep 3

# Test proxy to backend.php
curl -s http://localhost:5173/backend.php?op=rpc | head -5

# Kill servers
kill $DEV_PID $PHP_PID
```

### 2.3 Module Resolution Test

Open browser console and check:
```javascript
// Test Dojo modules load
console.log(typeof dojo);       // Should be "object"
console.log(typeof dojo.query); // Should be "function"

// Test dijit modules load
console.log(typeof dijit);     // Should be "object"

// Test fox modules load
console.log(typeof App);       // Should be "object"
```

---

## 3. Functional Tests

### 3.1 Application Load Test

1. Start dev server: `npm run dev`
2. Start PHP backend: `php -S localhost:8080`
3. Open browser: `http://localhost:5173`
4. Check:
   - [ ] Login page loads
   - [ ] Theme CSS applies correctly
   - [ ] Dojo widgets render
   - [ ] No JavaScript errors in console

### 3.2 Core Features Test

After logging in, test these features:

| Feature | Test Action | Expected Result |
|---------|-------------|-----------------|
| Feed Tree | Expand/collapse feeds | Tree renders correctly |
| Headlines | Load headlines | Headlines display |
| Article | Click article | Article content loads |
| Mark as Read | Mark article read | Visual change occurs |
| Search | Use search | Results display |
| Preferences | Open prefs | Preferences page loads |
| Night Mode | Toggle night mode | Theme changes |

### 3.3 Widget Test

Test these Dojo/dijit widgets:

- [ ] `dijit/form/Button` - Click handlers work
- [ ] `dijit/form/TextBox` - Input works
- [ ] `dijit/form/Select` - Dropdown works
- [ ] `dijit/Tree` - Tree navigation works
- [ ] `dijit/Dialog` - Dialog opens/closes
- [ ] `dijit/Menu` - Menu appears on click

---

## 4. Regression Tests

### 4.1 Compare with Legacy Build

Test the same features with the original PHP build:

1. Stop Vite dev server
2. Use original `index.php` directly
3. Compare behavior in browser

**Comparison Checklist:**
- [ ] Both builds show same login page
- [ ] Both builds load same fonts/CSS
- [ ] Both builds render widgets identically
- [ ] Both builds have same layout
- [ ] Both builds handle same edge cases

### 4.2 Hot Module Replacement Test

With Vite dev server running:

1. Modify `js/common.js` - Add `console.log('HMR test')`
2. Save file
3. Check browser console for HMR update
4. Verify change appears without full reload

### 4.3 Console Error Comparison

**Legacy Build (baseline):**
```
Open browser console
Navigate to app
Note any existing errors/warnings
```

**Vite Build (compare):**
```
Open browser console  
Navigate to http://localhost:5173
Compare errors/warnings with baseline
```

---

## 5. Performance Tests

### 5.1 Build Speed Comparison

```bash
# Time legacy Dojo build (if available)
time ./lib/dojo-src/rebuild-dojo.sh 2>/dev/null || echo "No legacy build script"

# Time Vite build
time npm run build
```

### 5.2 Dev Server Speed

```bash
# Start fresh dev server and measure
rm -rf node_modules/.vite
time npm run dev &
DEV_PID=$!
sleep 10
kill $DEV_PID

echo "First load completed"
```

### 5.3 Page Load Comparison

Use browser DevTools Network tab:
- [ ] Measure Time to First Byte (TTFB)
- [ ] Measure DOM Content Loaded
- [ ] Measure Full Load
- [ ] Compare Vite vs PHP build

---

## 6. Automated Test Script

Create a comprehensive test script:

```bash
#!/bin/bash
# test-vite-migration.sh

set -e

echo "=== Vite Migration Test Suite ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}✓ PASS${NC}: $1"; }
fail() { echo -e "${RED}✗ FAIL${NC}: $1"; }
warn() { echo -e "${YELLOW}⚠ WARN${NC}: $1"; }
info() { echo -e "  → $1"; }

# Test 1: Build Test
echo "--- Test 1: Production Build ---"
rm -rf dist
if npm run build > /dev/null 2>&1; then
    pass "Build completes"
    if [ -f "dist/index.html" ]; then
        pass "Output files generated"
    else
        fail "Output files missing"
    fi
else
    fail "Build failed"
fi
echo ""

# Test 2: Dev Server Test
echo "--- Test 2: Dev Server ---"
timeout 5 npm run dev > /tmp/vite-dev.log 2>&1 &
DEV_PID=$!
sleep 3

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    pass "Dev server responds"
else
    fail "Dev server not responding"
fi

kill $DEV_PID 2>/dev/null || true
echo ""

# Test 3: Proxy Test
echo "--- Test 3: Backend Proxy ---"
php -S localhost:8080 -t . > /tmp/php-server.log 2>&1 &
PHP_PID=$!
npm run dev > /tmp/vite-dev.log 2>&1 &
DEV_PID=$!
sleep 4

if curl -s http://localhost:5173/backend.php | grep -q "php"; then
    pass "Proxy works"
else
    warn "Proxy may need manual verification"
fi

kill $DEV_PID $PHP_PID 2>/dev/null || true
echo ""

# Test 4: LESS Compilation
echo "--- Test 4: LESS Compilation ---"
rm -f themes/light.css themes/night.css
if npm run less > /dev/null 2>&1; then
    pass "LESS compilation works"
else
    warn "LESS compilation had issues"
fi
echo ""

echo "=== Test Suite Complete ==="
```

Run it with:
```bash
chmod +x test-vite-migration.sh
./test-vite-migration.sh
```

---

## 7. Manual Test Checklist

Print and use this checklist:

```
VITE MIGRATION MANUAL TEST CHECKLIST
====================================

Date: _______________
Tester: ____________
Environment: ________

PRE-FLIGHT
[ ] npm install completed
[ ] No errors during install
[ ] node_modules/.vite is clean

BUILD TESTS
[ ] npm run build succeeds
[ ] dist/ directory created
[ ] dist/index.html exists
[ ] dist/assets/ contains files
[ ] npm run less compiles CSS

DEV SERVER TESTS
[ ] npm run dev starts
[ ] Server on port 5173
[ ] No ERROR-level console messages
[ ] Page loads in browser

FUNCTIONAL TESTS (in browser)
[ ] Login page displays
[ ] Can log in
[ ] Feed tree renders
[ ] Headlines load
[ ] Can click articles
[ ] Mark as read works
[ ] Night mode toggle works
[ ] Preferences page loads

WIDGET TESTS
[ ] Buttons clickable
[ ] Dropdowns work
[ ] Tree expands/collapses
[ ] Dialogs open/close
[ ] Forms submit

REGRESSION TESTS
[ ] Compare with PHP build
[ ] Same functionality
[ ] Same layout
[ ] Same performance feel

ISSUES FOUND
________________________________
________________________________
________________________________

OVERALL RESULT: [ ] PASS [ ] FAIL
```

---

## 8. CI/CD Integration

For automated testing, add to your CI pipeline:

```yaml
# .github/workflows/vite-test.yml
name: Vite Migration Tests

on:
  pull_request:
    paths:
      - 'vite.config.js'
      - 'package.json'
      - 'src/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build test
        run: npm run build
        
      - name: Dev server test
        run: |
          timeout 10 npm run dev &
          sleep 5
          curl -f http://localhost:5173
          
      - name: LESS compilation
        run: npm run less
```

---

## 9. Troubleshooting

### Issue: Dev server won't start

**Solution:**
```bash
rm -rf node_modules/.vite
npm install
npm run dev
```

### Issue: Proxy not working

**Solution:**
- Ensure PHP server is running on correct port
- Check proxy config in vite.config.js
- Verify CORS headers

### Issue: Modules not loading

**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Check module paths
ls -la lib/dojo/
ls -la lib/dijit/
```

### Issue: Build produces empty files

**Solution:**
- Check for syntax errors in modules
- Verify index.html exists
- Check Vite config output settings

---

## 10. Test Results Template

```
====================================
VITE MIGRATION TEST RESULTS
====================================

Date: [DATE]
Tester: [NAME]
Branch: [BRANCH]

BUILD TESTS
  Production Build:     [PASS/FAIL]
  Dev Server Start:    [PASS/FAIL]
  LESS Compilation:    [PASS/FAIL]

FUNCTIONAL TESTS
  Login Page:          [PASS/FAIL]
  Feed Tree:           [PASS/FAIL]
  Headlines:           [PASS/FAIL]
  Articles:            [PASS/FAIL]
  Mark as Read:        [PASS/FAIL]
  Night Mode:          [PASS/FAIL]
  Preferences:         [PASS/FAIL]

WIDGET TESTS
  Buttons:             [PASS/FAIL]
  Dropdowns:           [PASS/FAIL]
  Tree:                [PASS/FAIL]
  Dialogs:             [PASS/FAIL]

REGRESSION
  vs PHP Build:        [PASS/FAIL]

ISSUES:
[List any issues found]

NOTES:
[Additional notes]

OVERALL: [ ] PASS [ ] FAIL
====================================
```
