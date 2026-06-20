# CrisisCommand — Deployment Guide

## Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- GitHub account
- Vercel account (free)
- Render account (free)
- Groq API key (free at console.groq.com)

---

## Step 1 — Get Groq API Key (5 min)
1. Visit https://console.groq.com/keys
2. Click "Create API Key"
3. Copy the key — you'll need it for Render

---

## Step 2 — Push to GitHub (5 min)
```bash
cd CrisisCommand
git init
git add .
git commit -m "🚀 Initial CrisisCommand commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/crisiscommand.git
git push -u origin main
```

---

## Step 3 — Deploy Backend to Render (10 min)
1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `npm ci`
5. Set **Start Command**: `npm start`
6. Add Environment Variables:
   - `GROQ_API_KEY` = your Groq API key
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = *(leave blank for now, update after step 4)*
7. Click **Create Web Service**
8. Wait for deploy → Copy your Render URL (e.g., `https://crisiscommand-api.onrender.com`)

---

## Step 4 — Deploy Frontend to Vercel (5 min)
1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Set **Root Directory**: `frontend`
4. Add Environment Variable:
   - `VITE_API_URL` = your Render URL from Step 3
5. Click **Deploy**
6. Copy your Vercel URL (e.g., `https://crisiscommand.vercel.app`)

---

## Step 5 — Update CORS (2 min)
1. Go back to Render → Environment Variables
2. Set `FRONTEND_URL` = your Vercel URL
3. Render will auto-redeploy

---

## Local Development

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env — set GROQ_API_KEY
npm install
npm run dev
# API running at http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env
# .env already has VITE_API_URL=http://localhost:5000
npm install
npm run dev
# App running at http://localhost:5173
```

---

## Verify Deployment

```bash
# Backend health check
curl https://your-render-url.onrender.com/health

# Expected response:
# {"status":"OK","service":"CrisisCommand API","version":"1.0.0",...}
```

---

## Troubleshooting

| Issue                          | Fix                                                      |
|-------------------------------|----------------------------------------------------------|
| CORS errors in browser        | Ensure FRONTEND_URL is set correctly in Render           |
| AI not responding             | Verify GROQ_API_KEY is set in Render env vars            |
| Render service sleeps         | Free tier sleeps after 15 min — first request is slow    |
| Build fails on Vercel         | Check VITE_API_URL is set in Vercel env variables        |
| Data resets after redeploy    | Expected — in-memory storage only                        |
