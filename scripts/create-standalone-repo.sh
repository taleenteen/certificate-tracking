#!/bin/bash
# Script to create standalone gov-ui-tokens repo
# Run this from terminal: bash scripts/create-standalone-repo.sh

set -e

STANDALONE_DIR="/Users/mac/Projects/gov-ui-tokens"
SOURCE_DIR="/Users/mac/Projects/gov-nextjs/packages/gov-ui-tokens"

echo "Creating standalone repo at $STANDALONE_DIR..."

# Create directory
mkdir -p "$STANDALONE_DIR"

# Copy all files
cp -r "$SOURCE_DIR"/* "$STANDALONE_DIR/"

# Initialize git
cd "$STANDALONE_DIR"
git init
git add .
git commit -m "Initial commit: @gov-ui/tokens v1.0.0"

echo ""
echo "Done! Next steps:"
echo ""
echo "1. Create a new repo on GitHub (e.g., your-org/gov-ui-tokens)"
echo ""
echo "2. Add remote and push:"
echo "   cd $STANDALONE_DIR"
echo "   git remote add origin https://github.com/YOUR-ORG/gov-ui-tokens.git"
echo "   git push -u origin main"
echo ""
echo "3. Create release with:"
echo "   npm pack"
echo "   # Then upload .tgz to GitHub release"
