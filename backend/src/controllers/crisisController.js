const { v4: uuidv4 } = require('uuid');
const { StoreHelper, SEVERITY, STATUS, CATEGORY } = require('../data/store');
const { createError } = require('../middleware/errorHandler');

// GET /api/crises
const getAllCrises = (req, res) => {
  let crises = StoreHelper.getAllCrises();

  // Filters
  if (req.query.status)   crises = crises.filter(c => c.status === req.query.status);
  if (req.query.severity) crises = crises.filter(c => c.severity === req.query.severity);
  if (req.query.category) crises = crises.filter(c => c.category === req.query.category);
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    crises = crises.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.location?.city || '').toLowerCase().includes(q)
    );
  }

  // Sort: newest first
  crises = [...crises].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ success: true, count: crises.length, data: crises });
};

// GET /api/crises/:id
const getCrisisById = (req, res, next) => {
  const crisis = StoreHelper.getCrisisById(req.params.id);
  if (!crisis) return next(createError('Crisis not found', 404));
  res.json({ success: true, data: crisis });
};

// POST /api/crises
const createCrisis = (req, res, next) => {
  const { title, description, category, severity, location, affectedCount, reportedBy } = req.body;

  if (!Object.values(SEVERITY).includes(severity))
    return next(createError(`Invalid severity. Must be: ${Object.values(SEVERITY).join(', ')}`, 400));
  if (!Object.values(CATEGORY).includes(category))
    return next(createError(`Invalid category. Must be: ${Object.values(CATEGORY).join(', ')}`, 400));

  const crisis = {
    id            : uuidv4(),
    title         : title.trim(),
    description   : description?.trim() || '',
    category,
    severity,
    status        : STATUS.ACTIVE,
    location      : location || { city: 'Unknown', coordinates: null },
    affectedCount : parseInt(affectedCount) || 0,
    reportedBy    : reportedBy?.trim() || 'Anonymous',
    assignedTeams : [],
    timeline      : [{ timestamp: new Date().toISOString(), event: 'Crisis reported', actor: reportedBy || 'System' }],
    aiAnalysis    : null,
    createdAt     : new Date().toISOString(),
    updatedAt     : new Date().toISOString(),
  };

  StoreHelper.addCrisis(crisis);

  // Auto-create an alert
  StoreHelper.addAlert({
    id       : uuidv4(),
    message  : `New ${severity} crisis reported: "${title}"`,
    severity,
    crisisId : crisis.id,
    timestamp: new Date().toISOString(),
    read     : false,
  });

  res.status(201).json({ success: true, data: crisis });
};

// PUT /api/crises/:id
const updateCrisis = (req, res, next) => {
  const crisis = StoreHelper.getCrisisById(req.params.id);
  if (!crisis) return next(createError('Crisis not found', 404));

  const allowedFields = ['title', 'description', 'severity', 'status', 'location', 'affectedCount', 'assignedTeams', 'category', 'reportedBy'];
  const updates = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  // Track status change in timeline
  if (updates.status && updates.status !== crisis.status) {
    updates.timeline = [
      ...(crisis.timeline || []),
      { timestamp: new Date().toISOString(), event: `Status changed to "${updates.status}"`, actor: 'Command Center' },
    ];
  }

  const updated = StoreHelper.updateCrisis(req.params.id, updates);
  res.json({ success: true, data: updated });
};

// PATCH /api/crises/:id/status
const updateStatus = (req, res, next) => {
  const { status } = req.body;
  if (!status) return next(createError('Status is required', 400));
  if (!Object.values(STATUS).includes(status))
    return next(createError(`Invalid status. Must be: ${Object.values(STATUS).join(', ')}`, 400));

  const crisis = StoreHelper.getCrisisById(req.params.id);
  if (!crisis) return next(createError('Crisis not found', 404));

  const updated = StoreHelper.updateCrisis(req.params.id, {
    status,
    timeline: [
      ...(crisis.timeline || []),
      { timestamp: new Date().toISOString(), event: `Status updated to "${status}"`, actor: 'Command Center' },
    ],
  });
  res.json({ success: true, data: updated });
};

// POST /api/crises/:id/timeline
const addTimelineEvent = (req, res, next) => {
  const { event, actor } = req.body;
  if (!event) return next(createError('Event description is required', 400));

  const crisis = StoreHelper.getCrisisById(req.params.id);
  if (!crisis) return next(createError('Crisis not found', 404));

  const newEntry = { timestamp: new Date().toISOString(), event: event.trim(), actor: actor?.trim() || 'Unknown' };
  const updated = StoreHelper.updateCrisis(req.params.id, {
    timeline: [...(crisis.timeline || []), newEntry],
  });
  res.json({ success: true, data: updated });
};

// DELETE /api/crises/:id
const deleteCrisis = (req, res, next) => {
  const deleted = StoreHelper.deleteCrisis(req.params.id);
  if (!deleted) return next(createError('Crisis not found', 404));
  res.json({ success: true, message: 'Crisis deleted successfully' });
};

// GET /api/crises/meta/enums
const getEnums = (req, res) => {
  res.json({ success: true, data: { SEVERITY, STATUS, CATEGORY } });
};

module.exports = { getAllCrises, getCrisisById, createCrisis, updateCrisis, updateStatus, addTimelineEvent, deleteCrisis, getEnums };
