# Deployment Instructions

## Docker

Build:
  docker build -t leave-api .

Run:
  docker run -p 3001:3001 --env-file .env.production leave-api

## Health Check
  curl http://localhost:3001/health

## Required Env Vars
- NODE_ENV=production
- PORT=3001
- MONGODB_URI=...
- JWT_SECRET=...
- CORS_ORIGIN=https://your-frontend-domain.com
