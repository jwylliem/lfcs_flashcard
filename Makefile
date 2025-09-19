# Frontend Makefile for LFCS Flashcard Application

# Variables
S3_BUCKET := lfcs-flashcard-dev-37fch2j9
CLOUDFRONT_DISTRIBUTION_ID := E1VTED6RZ9EIAC
CLOUDFRONT_URL := https://d2mdnlr35ps0s3.cloudfront.net
BUILD_DIR := ./dist

# Default target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  build        - Build the React application"
	@echo "  deploy       - Build and deploy to AWS (S3 + CloudFront)"
	@echo "  upload       - Upload built files to S3"
	@echo "  invalidate   - Invalidate CloudFront cache"
	@echo "  clean        - Remove build artifacts"
	@echo "  dev          - Start development server"
	@echo "  install      - Install dependencies"

# Install dependencies
.PHONY: install
install:
	@echo "📦 Installing dependencies..."
	npm install

# Build the React application
.PHONY: build
build:
	@echo "🔨 Building React app..."
	npm run build

# Upload to S3
.PHONY: upload
upload: build
	@echo "☁️  Uploading to S3..."
	aws s3 sync $(BUILD_DIR)/ s3://$(S3_BUCKET)/ --delete

# Invalidate CloudFront cache
.PHONY: invalidate
invalidate:
	@echo "🔄 Invalidating CloudFront cache..."
	aws cloudfront create-invalidation --distribution-id $(CLOUDFRONT_DISTRIBUTION_ID) --paths "/*"

# Full deployment (build + upload + invalidate)
.PHONY: deploy
deploy: upload invalidate
	@echo "✅ Deployment complete! Visit: $(CLOUDFRONT_URL)"

# Clean build artifacts
.PHONY: clean
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)
	rm -rf node_modules/.cache

# Start development server
.PHONY: dev
dev:
	@echo "🚀 Starting development server..."
	npm run dev

# Lint the code
.PHONY: lint
lint:
	@echo "🔍 Linting code..."
	npm run lint

# Preview production build locally
.PHONY: preview
preview: build
	@echo "👀 Previewing production build..."
	npm run preview

# Check if AWS CLI is configured
.PHONY: check-aws
check-aws:
	@echo "🔐 Checking AWS configuration..."
	@aws sts get-caller-identity > /dev/null || (echo "❌ AWS CLI not configured. Run 'aws configure' first." && exit 1)
	@echo "✅ AWS CLI is configured"

# Deploy with AWS checks
.PHONY: deploy-safe
deploy-safe: check-aws deploy

# Show deployment info
.PHONY: info
info:
	@echo "📋 Deployment Information:"
	@echo "  S3 Bucket: $(S3_BUCKET)"
	@echo "  CloudFront Distribution: $(CLOUDFRONT_DISTRIBUTION_ID)"
	@echo "  CloudFront URL: $(CLOUDFRONT_URL)"
	@echo "  Build Directory: $(BUILD_DIR)"