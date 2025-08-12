#!/bin/bash

# P-Town POS Deployment Script
# This script builds and deploys the application to both Netlify and Firebase

set -e

echo "🏪 P-Town POS Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the p-town-pos directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run tests (optional - uncomment if you have tests)
# echo "🧪 Running tests..."
# npm run test:coverage

# Build for production
echo "🔨 Building for production..."
npm run build:prod

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed - build directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"

# Display build size information
echo "📊 Build size information:"
du -sh build/
echo ""

# Ask user which deployment they want
echo "Choose deployment option:"
echo "1) Deploy to Netlify"
echo "2) Deploy to Firebase"
echo "3) Deploy to both"
echo "4) Just build (no deployment)"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🚀 Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir=build
        else
            echo "❌ Netlify CLI not found. Install with: npm install -g netlify-cli"
        fi
        ;;
    2)
        echo "🚀 Deploying to Firebase..."
        if command -v firebase &> /dev/null; then
            firebase deploy --only hosting
        else
            echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
        fi
        ;;
    3)
        echo "🚀 Deploying to both Netlify and Firebase..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir=build
        else
            echo "❌ Netlify CLI not found. Install with: npm install -g netlify-cli"
        fi
        
        if command -v firebase &> /dev/null; then
            firebase deploy --only hosting
        else
            echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
        fi
        ;;
    4)
        echo "✅ Build completed. No deployment performed."
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo "📱 Your P-Town POS system is now optimized and ready for production!"