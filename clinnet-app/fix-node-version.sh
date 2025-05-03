#!/bin/bash

# Script to install and use the correct Node.js version for this project

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
    echo "NVM is not installed. Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    
    # Source nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    if ! command -v nvm &> /dev/null; then
        echo "Failed to install NVM. Please install it manually and try again."
        echo "Visit https://github.com/nvm-sh/nvm for installation instructions."
        exit 1
    fi
fi

# Read Node.js version from .nvmrc
NODE_VERSION=$(cat .nvmrc)

# Install the required Node.js version if not already installed
if ! nvm ls $NODE_VERSION &> /dev/null; then
    echo "Installing Node.js $NODE_VERSION..."
    nvm install $NODE_VERSION
fi

# Use the required Node.js version
echo "Switching to Node.js $NODE_VERSION..."
nvm use $NODE_VERSION

# Verify the Node.js version
echo "Current Node.js version:"
node -v

# Clean install dependencies
echo "Reinstalling dependencies..."
rm -rf node_modules
npm install

echo "Setup complete! You can now run 'npm run dev' to start the development server."