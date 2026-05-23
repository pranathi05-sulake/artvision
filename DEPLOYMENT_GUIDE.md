# ARTVISION - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended for Frontend)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Deploy Frontend**
```bash
cd frontend
vercel
```

**Step 3: Follow prompts:**
- Link to existing project or create new
- Set environment variables from `.env`
- Deploy!

**Live URL:** You'll get a URL like `https://artvision-xyz.vercel.app`

---

### Option 2: Netlify

**Step 1: Install Netlify CLI**
```bash
npm install -g netlify-cli
```

**Step 2: Deploy**
```bash
cd frontend
netlify deploy --prod
```

---

### Option 3: Railway (Full Stack)

**Step 1: Install Railway CLI**
```bash
npm install -g @railway/cli
```

**Step 2: Login and Deploy**
```bash
railway login
railway init
railway up
```

---

### Option 4: Docker Deployment (Any Platform)

**Using Docker Compose:**
```bash
cd docker
docker-compose up -d
```

**Deploy to:**
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

---

## 🌐 GitHub Pages (Static Demo)

For a quick static demo without backend:

**Step 1: Build Frontend**
```bash
cd frontend
npm run build
npm run export
```

**Step 2: Deploy to GitHub Pages**
```bash
git checkout -b gh-pages
git add out/
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

**Access at:** `https://pranathi05-sulake.github.io/artvision`

---

## ⚡ Fastest Option: Vercel One-Click

1. Go to https://vercel.com/new
2. Import your GitHub repo: `pranathi05-sulake/artvision`
3. Select `frontend` as root directory
4. Add environment variables
5. Click Deploy!

**Done in 2 minutes!** ✅

---

## 🔧 Environment Variables Needed

**Frontend (.env):**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.com
NEXT_PUBLIC_ML_URL=https://your-ml-service-url.com
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-frontend-url.com
```

**Backend (.env):**
```
DATABASE_URL=your-postgres-url
REDIS_URL=your-redis-url
JWT_SECRET=your-jwt-secret
PORT=4000
NODE_ENV=production
```

---

## 📱 Mobile-Friendly Deployment

Your app is already responsive and works on mobile browsers!

---

## 🎯 Recommended Setup

**For Demo/Presentation:**
- Frontend: Vercel (free, fast, reliable)
- Backend: Railway or Render (free tier)
- Database: Supabase or Railway Postgres (free tier)

**For Production:**
- Frontend: Vercel Pro
- Backend: AWS ECS or Railway
- Database: AWS RDS or managed PostgreSQL
- ML Service: AWS Lambda or dedicated server

---

## 🔗 Your Repository

**GitHub:** https://github.com/pranathi05-sulake/artvision

Ready to deploy! 🚀
