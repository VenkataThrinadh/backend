#!/bin/bash
# Deployment script for Real Estate API Server

echo "Starting deployment process..."

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Create uploads directory if it doesn't exist
echo "Creating uploads directory..."
mkdir -p public/uploads/properties
mkdir -p public/uploads/plans
mkdir -p public/uploads/avatars
mkdir -p public/uploads/cities
mkdir -p public/uploads/banners

# Set permissions
echo "Setting permissions..."
chmod -R 755 public/uploads

# Start the server
echo "Starting the server..."
npm start

echo "Deployment complete!"
