require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const crisisRoutes = require('./routes/crisisRoutes');
const aiRoutes = require('./routes/aiRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

const parseOrigins = (value) => (
  String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:3000',
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.FRONTEND_URLS)
]);

const isAllowedPreviewOrigin = (origin) => /^https:\/\/[^/]+\.vercel\.app$/i.test(origin);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const normalized = origin.replace(/\/$/, '');
    const allowed = allowedOrigins.has(normalized) || isAllowedPreviewOrigin(normalized);

    return allowed ? callback(null, true) : callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    service: 'CrisisCommand API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/crises', crisisRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`CrisisCommand API running on port ${PORT}`);
});

module.exports = app;
