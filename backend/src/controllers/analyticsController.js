const { StoreHelper } = require('../data/store');

// GET /api/analytics/overview
const getOverview = (req, res) => {
  const stats = StoreHelper.getStats();
  res.json({ success: true, data: stats });
};

// GET /api/analytics/alerts
const getAlerts = (req, res) => {
  const alerts = StoreHelper.getAlerts();
  const unread = alerts.filter(a => !a.read).length;
  res.json({ success: true, count: alerts.length, unread, data: alerts });
};

// PATCH /api/analytics/alerts/:id/read
const markAlertRead = (req, res) => {
  const alert = StoreHelper.markAlertRead(req.params.id);
  if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
  res.json({ success: true, data: alert });
};

// GET /api/analytics/timeline
const getTimeline = (req, res) => {
  const crises = StoreHelper.getAllCrises();
  const allEvents = crises.flatMap(c =>
    (c.timeline || []).map(t => ({ ...t, crisisId: c.id, crisisTitle: c.title, severity: c.severity }))
  );
  allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json({ success: true, count: allEvents.length, data: allEvents.slice(0, 50) });
};

module.exports = { getOverview, getAlerts, markAlertRead, getTimeline };
