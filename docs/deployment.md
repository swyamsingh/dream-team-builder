# Deployment Guide - Dream Team Builder

This guide covers deploying the Dream Team Builder application to production.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Torre API     │
│   (React/Vite)  │───▶│   (Node.js)     │───▶│   (External)    │
│   Static Files  │    │   Express API   │    │   Integration   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Deployment (Static Hosting)

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel --prod
```

### Option 2: Netlify
```bash
# Build the application
cd client
npm run build

# Deploy dist/ folder to Netlify
# Set build command: npm run build
# Set publish directory: dist
```

### Option 3: GitHub Pages
```bash
# Add to client/package.json
"homepage": "https://swyamsingh.github.io/dream-team-builder",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

## Backend Deployment (Server Hosting)

### Option 1: Railway (Recommended)
```bash
# Connect Railway to GitHub repo
# Set root directory: server
# Build command: npm install
# Start command: npm start
```

### Option 2: Render
```bash
# Create render.yaml in root:
services:
  - type: web
    name: dream-team-builder-api
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
```

### Option 3: Heroku
```bash
# Create Procfile in server directory:
web: node index.js

# Deploy
heroku create dream-team-builder-api
git subtree push --prefix server heroku main
```

## Environment Configuration

### Frontend (.env.production)
```bash
VITE_API_URL=https://your-api-domain.com
```

### Backend (.env)
```bash
NODE_ENV=production
PORT=3001
```

## Build Commands

### Frontend Build
```bash
cd client
npm install
npm run build
```

### Backend Build
```bash
cd server
npm install
# No build step needed for Node.js
```

## Complete Deployment Script

```bash
#!/bin/bash
# Full deployment script

echo "Building frontend..."
cd client
npm install
npm run build

echo "Preparing backend..."
cd ../server
npm install

echo "Deployment ready!"
echo "Frontend: Deploy 'client/dist' to static hosting"
echo "Backend: Deploy 'server' directory to Node.js hosting"
```

## Environment Variables Setup

### Frontend (Vite)
- `VITE_API_URL`: Backend API URL

### Backend (Node.js)
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (production/development)

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] API health check responds (`/health`)
- [ ] CORS configured for frontend domain
- [ ] API Analysis page displays
- [ ] Search functionality shows proper error handling
- [ ] Team Builder interface works
- [ ] All static assets load (CSS, images, icons)
- [ ] Mobile responsive design verified
- [ ] Error pages display correctly

## Performance Optimizations

### Frontend
- Vite automatic code splitting
- Image optimization
- CSS minification
- Gzip compression (hosting provider)

### Backend
- Express compression middleware
- API response caching
- Rate limiting (production)
- Error monitoring

## Monitoring & Maintenance

### Health Checks
- Frontend: Check page loads
- Backend: `GET /health` endpoint
- API Integration: Monitor Torre API calls

### Logging
- Frontend: Console errors tracking
- Backend: Request/response logging
- Error tracking (Sentry, LogRocket)

## Security Considerations

### Frontend
- Environment variables for API URLs
- HTTPS enforcement
- CSP headers (hosting provider)

### Backend
- CORS configuration
- Input validation
- Rate limiting
- Security headers (Helmet.js)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify backend CORS configuration
   - Check frontend API URL

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies installed

3. **API Timeouts**
   - Torre API may be unreachable
   - Implement proper error handling

4. **Mobile Issues**
   - Test responsive design
   - Check touch interactions

## Production URLs

Once deployed, update the README.md with:
- Frontend URL: `https://your-frontend-domain.com`
- Backend URL: `https://your-backend-domain.com`
- Demo Video: `Link to demo video`

## Scaling Considerations

For future scaling:
- CDN for static assets
- Load balancing for backend
- Database integration for team storage
- User authentication system
- API rate limiting and caching

---

This deployment guide ensures a production-ready implementation of the Dream Team Builder application suitable for Torre's technical evaluation.