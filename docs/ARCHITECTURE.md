# CrisisCommand — Architecture Document

## Overview
CrisisCommand is an AI-powered emergency crisis management platform built for hackathon speed.
It leverages Groq for intelligent crisis analysis, resource recommendations, and decision support.

---

## 1. Final Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCTION                               │
│                                                                 │
│  ┌─────────────────┐         ┌─────────────────────────────┐   │
│  │   Vercel CDN    │         │     Render.com (Free)       │   │
│  │ React + Vite    │◄───────►│   Node.js + Express API     │   │
│  │  + Tailwind CSS │  HTTPS  │   In-Memory Store           │   │
│  └─────────────────┘         └──────────────┬──────────────┘   │
│                                              │                  │
│                                    ┌─────────▼──────────┐      │
│                                    │  Google Gemini API  │      │
│                                    │  (gemini-1.5-flash) │      │
│                                    └────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Folder Structure

```
CrisisCommand/
├── frontend/                        # React + Vite + Tailwind
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Layout, LoadingSpinner, EmptyState, PageHeader
│   │   │   ├── crisis/              # CrisisCard, CrisisFilters, StatusBadge
│   │   │   ├── dashboard/           # StatCard
│   │   │   └── ai/                  # AIResponseCard
│   │   ├── pages/                   # Dashboard, CrisesPage, CrisisDetailPage,
│   │   │                            # CreateCrisisPage, ResourcesPage,
│   │   │                            # AICommandPage, AnalyticsPage
│   │   ├── hooks/                   # useCrises, useAnalytics
│   │   ├── services/api.js          # Axios API layer
│   │   ├── utils/helpers.js         # Formatting & config constants
│   │   ├── App.jsx                  # Router
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Tailwind + custom components
│   ├── vercel.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
│
├── backend/                         # Node.js + Express
│   ├── src/
│   │   ├── server.js                # Entry point
│   │   ├── data/store.js            # In-memory store + seed data
│   │   ├── routes/                  # crisisRoutes, aiRoutes, resourceRoutes, analyticsRoutes
│   │   ├── controllers/             # crisisController, aiController, resourceController, analyticsController
│   │   └── middleware/              # errorHandler, notFound, validate
│   ├── render.yaml
│   ├── package.json
│   └── .env.example
│
└── docs/
    ├── ARCHITECTURE.md              # This file
    └── DEPLOYMENT.md
```

---

## 3. Data Models (In-Memory)

### Crisis
```json
{
  "id": "uuid-v4",
  "title": "string",
  "description": "string",
  "category": "natural_disaster|infrastructure|public_health|security|environmental|other",
  "severity": "low|medium|high|critical",
  "status": "active|contained|resolved",
  "location": { "city": "string", "coordinates": { "lat": float, "lng": float } },
  "affectedCount": 0,
  "reportedBy": "string",
  "assignedTeams": ["string"],
  "timeline": [{ "timestamp": "ISO", "event": "string", "actor": "string" }],
  "aiAnalysis": { "prompt": "string", "response": "string", "timestamp": "ISO" },
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

### Resource
```json
{
  "id": "uuid-v4",
  "name": "string",
  "type": "response_team|rescue_team|medical|hazmat|utility|logistics|security|air_support|other",
  "status": "available|deployed|on_standby|unavailable",
  "capacity": 0,
  "location": "string",
  "contact": "string",
  "specialization": "string"
}
```

### Alert
```json
{
  "id": "uuid-v4",
  "message": "string",
  "severity": "low|medium|high|critical",
  "crisisId": "uuid-v4",
  "timestamp": "ISO",
  "read": false
}
```

---

## 4. API Endpoints

### Crises  `BASE/api/crises`
| Method   | Endpoint          | Description                         |
|----------|-------------------|-------------------------------------|
| GET      | /                 | Get all crises (filterable)         |
| GET      | /meta/enums       | Get severity/status/category enums  |
| GET      | /:id              | Get crisis by ID                    |
| POST     | /                 | Create new crisis                   |
| PUT      | /:id              | Update crisis                       |
| PATCH    | /:id/status       | Update crisis status only           |
| POST     | /:id/timeline     | Add timeline event                  |
| DELETE   | /:id              | Delete crisis                       |

### AI  `BASE/api/ai`
| Method | Endpoint                | Description                          |
|--------|-------------------------|--------------------------------------|
| POST   | /analyze/:crisisId      | Analyze a specific crisis            |
| POST   | /recommend-resources    | Get resource allocation advice       |
| POST   | /generate-report        | Generate formal SITREP report        |
| POST   | /chat                   | General AI chat                      |
| POST   | /prioritize             | Prioritize all active crises         |
| GET    | /logs                   | Get AI interaction logs              |

### Resources  `BASE/api/resources`
| Method | Endpoint          | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | /                 | Get all resources (filterable)       |
| GET    | /meta/types       | Get resource types & statuses        |
| GET    | /:id              | Get resource by ID                   |
| POST   | /                 | Create new resource                  |
| PUT    | /:id              | Update resource                      |
| PATCH  | /:id/status       | Update resource status only          |

### Analytics  `BASE/api/analytics`
| Method | Endpoint          | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | /overview         | Get all stats (KPIs)                 |
| GET    | /alerts           | Get all alerts                       |
| PATCH  | /alerts/:id/read  | Mark alert as read                   |
| GET    | /timeline         | Get merged timeline across all crises|

---

## 5. Frontend Pages

| Route          | Page              | Description                            |
|----------------|-------------------|----------------------------------------|
| /              | Dashboard         | KPIs, active crises, quick actions     |
| /crises        | CrisesPage        | Filterable crisis list                 |
| /crises/new    | CreateCrisisPage  | Crisis report form                     |
| /crises/:id    | CrisisDetailPage  | Full details + AI analysis + timeline  |
| /resources     | ResourcesPage     | Resource grid + status management      |
| /ai            | AICommandPage     | Chat / Prioritize / Resource Advisor   |
| /analytics     | AnalyticsPage     | Charts, alerts, activity timeline      |

---

## 6. Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=CrisisCommand
VITE_APP_VERSION=1.0.0
```

---

## 7. Development Order (7-Hour Plan)

| Hour | Task                                                              |
|------|-------------------------------------------------------------------|
| 1    | Setup repos, install deps, get backend health endpoint running   |
| 2    | Build data store + all 4 route/controller groups                 |
| 3    | Integrate Gemini AI — test all 5 AI endpoints                    |
| 4    | Frontend: Layout, Dashboard, Crises list + detail pages          |
| 5    | Frontend: Create Crisis form + Resources page                    |
| 6    | Frontend: AI Command page + Analytics page                       |
| 7    | Deploy backend to Render, frontend to Vercel, final testing      |

---

## 8. Deployment Architecture

```
GitHub Repository
      │
      ├─── /frontend ──► Vercel (auto-deploy on push to main)
      │                   • Build: npm run build
      │                   • Output: dist/
      │                   • SPA rewrites via vercel.json
      │                   • Env: VITE_API_URL = Render URL
      │
      └─── /backend ───► Render.com (auto-deploy on push to main)
                          • Build: npm install
                          • Start: npm start
                          • Health: GET /health
                          • Env: GROQ_API_KEY (secret)
                                 FRONTEND_URL (Vercel URL)
```
