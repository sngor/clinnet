#!/bin/bash

echo "🔄 Updating project dependencies..."

# Check Node.js version
NODE_VERSION=$(node -v)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1 | tr -d 'v')

if [ "$NODE_MAJOR_VERSION" -ne "18" ]; then
  echo "⚠️ Warning: This project is optimized for Node.js 18. You're using $NODE_VERSION."
  echo "Consider running 'nvm use' if you have nvm installed, or install Node.js 18."
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Update package.json dependencies without installing
echo "📋 Updating package.json dependencies..."
npx npm-check-updates -u

# Selectively update problematic dependencies
echo "🛠️ Fixing specific deprecated packages..."
npx npm-check-updates -u react-router-dom@6.21.3 date-fns@2.30.0 -t minor

# Install everything clean
echo "🧹 Cleaning node_modules and reinstalling..."
rm -rf node_modules package-lock.json
npm install

echo "✅ Dependencies updated successfully!"
echo "Run 'npm run dev' to start the development server."
