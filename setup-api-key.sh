#!/bin/bash
# Secure API Key Setup Script
# Run this in your terminal to add the API key securely

echo "🔐 Secure API Key Setup for AIJobHelper"
echo "========================================"
echo ""
echo "This script will securely add your OpenRouter API key to .env.local"
echo ""
read -sp "Enter your OpenRouter API key (input hidden): " api_key
echo ""

if [ -z "$api_key" ]; then
    echo "❌ No key provided. Exiting."
    exit 1
fi

cd "$(dirname "$0")/frontend"

# Backup existing .env.local
if [ -f .env.local ]; then
    cp .env.local .env.local.backup
    echo "📋 Backed up existing .env.local to .env.local.backup"
fi

# Update the OPENROUTER_API_KEY line
if grep -q "^OPENROUTER_API_KEY=" .env.local; then
    # Replace existing line
    sed -i '' "s|^OPENROUTER_API_KEY=.*|OPENROUTER_API_KEY=$api_key|" .env.local
else
    # Add new line
    echo "OPENROUTER_API_KEY=$api_key" >> .env.local
fi

echo "✅ API key added to .env.local successfully!"
echo "🔒 Your key is secure and not exposed in any logs"
echo ""
echo "Next steps:"
echo "1. Restart your dev server (Ctrl+C and run 'npm run dev' again)"
echo "2. Try uploading a resume - it should now use AI parsing!"
echo ""
