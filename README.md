# CrisisCommand

> AI-powered emergency operations dashboard for crisis reporting, response coordination, resource management, and situation awareness.

[Frontend](#deployment-links) | [Backend](#deployment-links) | [Tech Stack](#tech-stack) | [Screenshots](#screenshots) | [Setup](#local-development)

---

## Problem Statement

Emergency response teams often work across fragmented tools, delayed updates, and inconsistent situational awareness. During a live incident, that creates avoidable delays in triage, resource allocation, and command decisions.

CrisisCommand solves that gap by giving responders one command center for crisis intake, live tracking, AI-assisted prioritization, resource coordination, and operational reporting.

---

## Solution

CrisisCommand is a full-stack crisis management platform designed for emergency operations centers and hackathon demos alike.

It combines:
- A real-time crisis dashboard
- Structured crisis intake
- Resource tracking and assignment
- AI chat, prioritization, resource advice, and SITREP generation
- Analytics and alerts for command visibility

The goal is simple: help teams move from incident report to operational action faster.

---

## Features

- Crisis creation with title, severity, category, location, affected population, and description
- Crisis list with filtering, status management, and detail views
- Resource management with availability and deployment status
- AI Command Center with:
  - Emergency Chat
  - Crisis Prioritization
  - Resource Advisor
  - SITREP Generator
- Live dashboard KPIs for active crises, critical incidents, affected population, and resource readiness
- Analytics views with charts, alerts, and activity timelines
- Automatic dashboard refresh via polling
- Responsive dark-mode interface optimized for emergency operations workflows

---

## Architecture

### High-Level Flow

```text
React + Vite frontend
        |
        | Axios API requests
        v
Express backend API
        |
        | In-memory crisis/resource store
        | AI orchestration layer
        v
Groq-powered emergency decision support
```

### Backend Services

- `GET /health`
- `GET /api/crises`
- `POST /api/crises`
- `GET /api/resources`
- `GET /api/analytics/overview`
- `POST /api/ai/chat`
- `POST /api/ai/prioritize`
- `POST /api/ai/generate-report`

### Frontend Pages

- Dashboard
- Crises
- Crisis Detail
- Create Crisis
- Resources
- AI Command
- Analytics

---

## Screenshots

Add your project screenshots here to make the submission stand out.

Recommended screenshots:
- Dashboard
- Crisis list
- Crisis detail with AI analysis
- AI Command Center
- Analytics view

Example layout:

```md
![Dashboard](./docs/screenshots/dashboard.png)
![AI Command](./docs/screenshots/ai-command.png)
![Analytics](./docs/screenshots/analytics.png)
```

---

## Deployment Links

Update these with your live demo URLs:

- Frontend: `https://your-vercel-app.vercel.app`
- Backend: `https://your-render-service.onrender.com`
- Health check: `https://your-render-service.onrender.com/health`

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router |
| HTTP | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Backend | Node.js, Express |
| AI | Groq |
| Runtime Storage | In-memory store |
| Deployment | Vercel, Render |

---

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+
- Groq API key

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Environment Variables

#### Backend

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ANAKIN_API_KEY=your_anakin_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

#### Frontend

```env
VITE_API_URL=http://localhost:5000
```

---

## Why This Can Win

- Clear real-world problem with immediate relevance
- Strong command-center UX that feels demo-ready
- AI features are integrated into real workflows, not bolted on
- Polished visuals with operational focus
- Covers both tactical response and executive visibility

---

## Future Scope

- Persistent database storage
- Role-based access control
- Map-based incident and resource visualization
- WebSocket live updates instead of polling
- Exportable PDF incident reports
- SMS/email alerting for field teams
- Audit logs and command history
- Multi-agency collaboration and permissions

---

## License

This project is intended for hackathon and prototype use.
