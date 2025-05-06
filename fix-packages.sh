#!/bin/bash
cd clinnet-app
echo "Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json
echo "Installing packages with npm install to generate a fresh package-lock.json..."
npm install
echo "Done! Your package-lock.json should now be in sync with package.json"
