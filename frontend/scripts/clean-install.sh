#!/bin/bash

echo "🧹 Cleaning project..."

# Remove node_modules
echo "Removing node_modules..."
rm -rf node_modules

# Remove package-lock.json
echo "Removing package-lock.json..."
rm -f package-lock.json

# Remove Vite cache
echo "Removing Vite cache..."
rm -rf node_modules/.vite

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Clean installation complete!"
echo "Run 'npm run minimal' to test a minimal React app"
