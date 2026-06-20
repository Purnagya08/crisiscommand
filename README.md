# ⚡ CrisisCommand

> AI-powered emergency crisis management platform — built for speed and impact.

![Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-blue)
![Stack](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Stack](https://img.shields.io/badge/AI-Google%20Gemini-orange)
![Deploy](https://img.shields.io/badge/Frontend-Vercel-black)
![Deploy](https://img.shields.io/badge/Backend-Render-purple)

---

## 🚀 Features

- 🗺️ **Real-time Crisis Dashboard** — Live KPIs, active crises, severity tracking
- 🆕 **Crisis Reporting** — Form with category, severity, location, affected count
- 🔍 **Crisis Management** — Filter, search, update status, add timeline events
- 🤖 **AI Analysis** — Gemini AI analyzes any crisis: situation, actions, resources, ETA
- 📋 **SITREP Generator** — Auto-generates formal situation reports
- 🎯 **AI Prioritization** — AI ranks all active crises and creates action plans
- 💬 **AI Chat** — Natural language Q&A with emergency management context
- 📦 **Resource Management** — Track teams, deploy/standby/available status
- 📊 **Analytics** — Charts by severity & category, alerts feed, activity timeline
- 🔔 **Alert System** — Auto-alerts on new crisis creation

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS 3    |
| Routing    | React Router v6                   |
| Charts     | Recharts                          |
| Icons      | Lucide React                      |
| HTTP       | Axios                             |
| Backend    | Node.js + Express                 |
| AI         | Google Gemini (gemini-1.5-flash)  |
| Storage    | In-memory (no database)           |
| Deploy FE  | Vercel                            |
| Deploy BE  | Render                            |

---

## ⚡ Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/crisiscommand.git
cd crisiscommand

# Backend
cd backend
cp .env.example .env      # Add GEMINI_API_KEY
npm install
npm run dev               # http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000
npm install
npm run dev               # http://localhost:5173
```

---

## 📡 API Overview

```
GET  /health                         # Health check
GET  /api/crises                     # List crises (filterable)
POST /api/crises                     # Create crisis
GET  /api/crises/:id                 # Crisis detail
PATCH /api/crises/:id/status         # Update status
POST /api/crises/:id/timeline        # Add timeline event
POST /api/ai/analyze/:crisisId       # AI crisis analysis
POST /api/ai/chat                    # AI chat
POST /api/ai/prioritize              # AI prioritization
POST /api/ai/generate-report         # Generate SITREP
GET  /api/resources                  # List resources
POST /api/resources                  # Add resource
GET  /api/analytics/overview         # KPI stats
GET  /api/analytics/alerts           # Alert feed
```

---

## 📦 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full step-by-step guide.

**Frontend → Vercel** | **Backend → Render** | **AI → Google Gemini Free Tier**

---

## 🏗️ Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full architecture, data models, and development order.

---

*Built with ⚡ for hackathon speed.*
