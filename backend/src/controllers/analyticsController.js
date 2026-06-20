const { StoreHelper } = require('../data/store');

const getOverview = (req, res) => {
  res.json({ success: true, data: StoreHelper.getStats() });
};

const getAlerts = (req, res) => {
  const alerts = StoreHelper.getAlerts();
  res.json({
    success: true,
    count: alerts.length,
    unread: alerts.filter((alert) => !alert.read).length,
    data: alerts
  });
};

const markAlertRead = (req, res) => {
  const alert = StoreHelper.markAlertRead(req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }
  return res.json({ success: true, data: alert });
};

const getTimeline = (req, res) => {
  const events = StoreHelper.getAllCrises()
    .flatMap((crisis) => (crisis.timeline || []).map((item) => ({
      ...item,
      crisisId: crisis.id,
      crisisTitle: crisis.title,
      severity: crisis.severity,
      status: crisis.status
    })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({ success: true, count: events.length, data: events.slice(0, 50) });
};

module.exports = { getOverview, getAlerts, markAlertRead, getTimeline };
