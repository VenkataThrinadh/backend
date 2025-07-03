# Real Estate API Server

## Overview
This is the backend API server for the Real Estate application. It provides endpoints for authentication, property management, and user profile management.

## Setup
1. Install dependencies:
   ```
   npm install
   ```

2. Create a .env file with the required environment variables (see .env.example)

3. Start the server:
   ```
   npm start
   ```

## API Endpoints
- Authentication: /api/auth
- Properties: /api/properties
- Users: /api/users
- Favorites: /api/favorites
- Enquiries: /api/enquiries
- Uploads: /api/uploads
- Cities: /api/cities
- Banners: /api/banners
- Admin: /api/admin
- Amenities: /api/amenities
- Specifications: /api/specifications
- Plans: /api/plans
- Plots: /api/plots
- Land Plots: /api/land-plots
- Block Config: /api/block-config

## Health Check Endpoints
- /health
- /api/health
- /mobile-health

## Mobile API Endpoints
- /api/auth/register-api
- /api/auth/login-api
- /api/auth/profile-api

## Database
This application uses Supabase PostgreSQL as the database.
