#!/bin/bash

# Craftify Email Development Setup Script
# This script sets up the development environment for the monorepo

set -e

echo "🚀 Setting up Craftify Email development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "Please update Node.js to version 18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."
npm run install:workspaces

# Build shared packages
echo "🔨 Building shared packages..."
npm run build --workspace=@craftify/shared

# Create environment files
echo "⚙️ Creating environment files..."

if [ ! -f "apps/web/.env.local" ]; then
    echo "Creating apps/web/.env.local..."
    cat > apps/web/.env.local << EOF
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=Craftify Email
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
EOF
fi

if [ ! -f "apps/api/.env.local" ]; then
    echo "Creating apps/api/.env.local..."
    cat > apps/api/.env.local << EOF
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=dev-secret-key-change-in-production
OKTA_ISSUER=https://your-domain.okta.com
OKTA_CLIENT_ID=your-client-id
OKTA_CLIENT_SECRET=your-client-secret
DYNAMODB_REGION=us-east-1
REDIS_URL=redis://localhost:6379
EOF
fi

# Create .gitignore entries if they don't exist
if [ ! -f ".gitignore" ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF
fi

# Check if Docker is available for local development
if command -v docker &> /dev/null; then
    echo "🐳 Docker is available. You can use docker-compose for local development."
    echo "Run: docker-compose up -d"
else
    echo "⚠️  Docker is not installed. Some local development features may not work."
    echo "Consider installing Docker for full local development experience."
fi

# Check if Redis is available
if command -v redis-cli &> /dev/null; then
    echo "✅ Redis is available locally."
else
    echo "⚠️  Redis is not installed locally. Backend features may not work properly."
    echo "Install Redis or use Docker: docker run -d -p 6379:6379 redis:7-alpine"
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the frontend: npm run dev"
echo "2. Start the backend: npm run dev:api"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Useful commands:"
echo "- npm run build          # Build all packages"
echo "- npm run test           # Run all tests"
echo "- npm run lint           # Lint all packages"
echo "- npm run type-check     # Type check all packages"
echo ""
echo "Happy coding! 🚀" 