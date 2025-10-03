#!/bin/bash

# Frontend Validation Script for Clinnet EMR
# Validates the frontend application setup and configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🔍 Starting Clinnet EMR Frontend Validation"

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Validate package.json
print_status "Validating package.json..."
if [ -f "package.json" ]; then
    # Check if required dependencies exist
    REQUIRED_DEPS=("react" "react-dom" "react-router-dom" "@mui/material" "amazon-cognito-identity-js" "axios" "vite")
    MISSING_DEPS=()
    
    for dep in "${REQUIRED_DEPS[@]}"; do
        if ! grep -q "\"$dep\"" package.json; then
            MISSING_DEPS+=("$dep")
        fi
    done
    
    if [ ${#MISSING_DEPS[@]} -eq 0 ]; then
        print_success "All required dependencies found"
    else
        print_error "Missing dependencies: ${MISSING_DEPS[*]}"
        exit 1
    fi
else
    print_error "package.json not found"
    exit 1
fi

# Check Vite configuration
print_status "Validating Vite configuration..."
if [ -f "vite.config.js" ]; then
    if grep -q "@vitejs/plugin-react" vite.config.js; then
        print_success "Vite React plugin configured"
    else
        print_warning "Vite React plugin not found in configuration"
    fi
    
    if grep -q "outDir.*build" vite.config.js; then
        print_success "Build output directory set to 'build'"
    else
        print_warning "Build output directory not set to 'build' (may cause deployment issues)"
    fi
else
    print_error "vite.config.js not found"
    exit 1
fi

# Check environment files
print_status "Validating environment configuration..."
if [ -f ".env.example" ]; then
    print_success ".env.example found"
else
    print_warning ".env.example not found"
fi

if [ -f ".env.development" ]; then
    print_success ".env.development found"
else
    print_warning ".env.development not found"
fi

# Check source directory structure
print_status "Validating source directory structure..."
REQUIRED_DIRS=("src" "src/app" "src/components" "src/services" "src/utils" "src/pages")
MISSING_DIRS=()

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        MISSING_DIRS+=("$dir")
    fi
done

if [ ${#MISSING_DIRS[@]} -eq 0 ]; then
    print_success "All required directories found"
else
    print_error "Missing directories: ${MISSING_DIRS[*]}"
    exit 1
fi

# Check key files
print_status "Validating key application files..."
KEY_FILES=(
    "src/main.jsx"
    "src/app/App.jsx"
    "src/app/router.jsx"
    "src/app/providers/AppProviders.jsx"
    "src/app/providers/AuthProvider.jsx"
    "src/services/config.js"
    "src/services/api.js"
    "index.html"
)

MISSING_FILES=()
for file in "${KEY_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    print_success "All key files found"
else
    print_error "Missing files: ${MISSING_FILES[*]}"
    exit 1
fi

# Check if node_modules exists
print_status "Checking dependencies installation..."
if [ -d "node_modules" ]; then
    print_success "Dependencies installed"
else
    print_warning "Dependencies not installed. Run 'npm install'"
fi

# Validate build process
print_status "Testing build process..."
if npm run build > /dev/null 2>&1; then
    print_success "Build process successful"
    
    # Check if build directory was created
    if [ -d "build" ]; then
        print_success "Build directory created"
        
        # Check if index.html exists in build
        if [ -f "build/index.html" ]; then
            print_success "index.html generated in build directory"
        else
            print_error "index.html not found in build directory"
        fi
        
        # Check if assets directory exists
        if [ -d "build/assets" ]; then
            print_success "Assets directory created"
            
            # Count JS and CSS files
            JS_COUNT=$(find build/assets -name "*.js" | wc -l)
            CSS_COUNT=$(find build/assets -name "*.css" | wc -l)
            
            print_status "Generated assets: ${JS_COUNT} JS files, ${CSS_COUNT} CSS files"
        else
            print_warning "Assets directory not found in build"
        fi
    else
        print_error "Build directory not created"
    fi
else
    print_error "Build process failed"
    exit 1
fi

# Check linting (if available)
print_status "Checking code quality..."
if npm run lint > /dev/null 2>&1; then
    print_success "Linting passed"
else
    print_warning "Linting issues found or linter not configured"
fi

# Check for common issues
print_status "Checking for common issues..."

# Check for console.log statements in production code
if grep -r "console\.log" src/ --exclude-dir=tests --exclude="*.test.*" > /dev/null 2>&1; then
    print_warning "console.log statements found in source code (consider removing for production)"
fi

# Check for TODO comments
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX" src/ 2>/dev/null | wc -l || echo "0")
if [ "$TODO_COUNT" -gt 0 ]; then
    print_warning "Found $TODO_COUNT TODO/FIXME comments in source code"
fi

# Check for unused imports (basic check)
if command -v eslint &> /dev/null; then
    UNUSED_IMPORTS=$(npx eslint src/ --rule 'no-unused-vars: error' --format compact 2>/dev/null | grep -c "is defined but never used" || echo "0")
    if [ "$UNUSED_IMPORTS" -gt 0 ]; then
        print_warning "Found $UNUSED_IMPORTS potential unused imports"
    fi
fi

# Performance checks
print_status "Checking bundle size..."
if [ -d "build/assets" ]; then
    TOTAL_SIZE=$(du -sh build/ | cut -f1)
    JS_SIZE=$(find build/assets -name "*.js" -exec du -ch {} + | tail -1 | cut -f1)
    CSS_SIZE=$(find build/assets -name "*.css" -exec du -ch {} + | tail -1 | cut -f1)
    
    print_status "Bundle sizes: Total: $TOTAL_SIZE, JS: $JS_SIZE, CSS: $CSS_SIZE"
    
    # Check for large files (>1MB)
    LARGE_FILES=$(find build/assets -size +1M -name "*.js" | wc -l)
    if [ "$LARGE_FILES" -gt 0 ]; then
        print_warning "Found $LARGE_FILES JavaScript files larger than 1MB"
        find build/assets -size +1M -name "*.js" -exec ls -lh {} \;
    fi
fi

# Security checks
print_status "Running basic security checks..."

# Check for hardcoded secrets (basic patterns)
SECRET_PATTERNS=("password.*=" "secret.*=" "key.*=" "token.*=")
SECRETS_FOUND=0

for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -ri "$pattern" src/ --exclude-dir=tests > /dev/null 2>&1; then
        SECRETS_FOUND=$((SECRETS_FOUND + 1))
    fi
done

if [ "$SECRETS_FOUND" -gt 0 ]; then
    print_warning "Found $SECRETS_FOUND potential hardcoded secrets (review manually)"
else
    print_success "No obvious hardcoded secrets found"
fi

# Final summary
print_status "📊 Validation Summary"
echo ""
print_success "✅ Frontend validation completed successfully!"
print_status "Your Clinnet EMR frontend application is ready for deployment."
echo ""
print_status "Next steps:"
print_status "1. Deploy backend infrastructure first"
print_status "2. Run frontend deployment script"
print_status "3. Test the complete application"
echo ""
print_success "🚀 Ready for deployment!"