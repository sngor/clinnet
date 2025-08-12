#!/bin/bash
# Comprehensive deployment readiness check script

set -e

echo "🔍 Clinnet-EMR Deployment Readiness Check"
echo "========================================"

# Check prerequisites
echo "📋 Checking prerequisites..."

# AWS Configuration
echo "⚡ AWS Configuration:"
aws configure list
if [ $? -ne 0 ]; then
    echo "❌ AWS credentials not configured"
    exit 1
fi

# Environment files
echo "📁 Checking environment files..."
if [ ! -f "frontend/.env" ]; then
    echo "❌ frontend/.env missing"
    exit 1
fi

# Run backend tests
echo "🧪 Running backend tests..."
cd backend
source test_env/bin/activate
python test_end_to_end.py
if [ $? -ne 0 ]; then
    echo "❌ Backend tests failed"
    exit 1
fi

# Validate SAM template
echo "📝 Validating SAM template..."
sam validate
if [ $? -ne 0 ]; then
    echo "❌ SAM template validation failed"
    exit 1
fi

# Check frontend build
echo "🏗️ Checking frontend build..."
cd ../frontend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ All deployment checks passed!"
echo "Run backend/deploy_validation.py to proceed with deployment"
