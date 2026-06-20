const { v4: uuidv4 } = require('uuid');
const { StoreHelper, SEVERITY, STATUS, CATEGORY } = require('../data/store');
const { createError } = require('../middleware/errorHandler');

const getAllCrises = (req, res) => {
  let crises = [...StoreHelper.getAllCrises()];
  const { status, severity, category, search } = req.query;

  if (status) crises = crises.filter((crisis) => crisis.status === status);
  if (severity) crises = crises.filter((crisis) => crisis.severity === severity);
  if (category) crises = crises.filter((crisis) => crisis.category === category);
  if (search) {
    const query = search.toLowerCase();
    crises = crises.filter((crisis) => (
      crisis.title.toLowerCase().includes(query) ||
      crisis.description.toLowerCase().includes(query) ||
      (crisis.location && crisis.location.city || '').toLowerCase().includes(query)
    ));
  }

  crises.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, count: crises.length, data: crises });
};

const getCrisisById = (req, res, next) => {
  const crisis = StoreHelper.getCrisisById(req.params.id);
  if (!crisis) return next(createError('Crisis not found', 404));
  return res.json({ success: true, data: crisis });
};

const createCrisis = (req, res, next) => {
  const { title, description, category, severity, location, affectedCount, reportedBy } = req.body;

  if (!Object.values(CATEGORY).includes(category)) {
    return next(createError(`Invalid category. Must be one of: ${Object.values(CATEGORY).join(', ')}`, 400));
  }

  if (!Object.values(SEVERITY).includes(severity)) {
    return next(createError(`Invalid severity. Must be one of: ${Object.values(SEVERITY).join(', ')}`, 400));
  }

  const timestamp = new Date().toISOString();
  const reporter = reportedBy && reportedBy.trim() ? reportedBy.trim() : 'Anonymous';

  const crisis = {
    id: uuidv4(),
    title: title.trim(),
    description: description ? description.trim() : '',
    category,
    severity,
    status: STATUS.ACTIVE,
    location: location || { city: 'Unknown', coordinates: null },
    affectedCount: Number.parseInt(affectedCount, 10) || 0,
    reportedBy: reporter,
    assignedTeams: [],
    timeline: [{ timestamp, event: 'Crisis reported', actor: reporter }],
    aiAnalysis: null,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  StoreHelper.addCrisis(crisis);
  StoreHelper.addAlert({
    id: uuidv4(),
    message: `New ${severity} crisis reported: "${crisis.title}"`,
    severity,
    crisisId: crisis.id,
    timestamp,
    read: false
  });

  return res.status(201).json({ success: true, data: crisis });
};

const updateCrisis = (req, res, next) => {
  const crisis = StoreHelper.getCrisisById(req.params.id);
  if (!crisis) return next(createError('Crisis not found', 404));

  const allowedFields = [
    'title',
    'description',
    'category',
    'severity',
    'status',
    'location',
    'affectedCount',
    'reportedBy',
    'assignedTeams'
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (updates.category && !Object.values(CATEGORY).includes(updates.category)) {
    return next(createError(`Invalid category. Must be one of: ${Object.values(CATEGORY).join(', ')}`, 400));
  }

  if (updates.severity && !Object.values(SEVERITY).includes(updates.severity)) {
    return next(createError(`Invalid severity. Must be one of: ${Object.values(SEVERITY).join(', ')}`, 400));
  }

  if (updates.status && !Object.values(STATUS).includes(updates.status)) {
    return next(createError(`Invalid status. Must be one of: ${Object.values(STATUS).join(', ')}`, 400));
  }

  if (updates.affectedCount !== undefined) {
    updates.affectedCount = Number.parseInt(updates.affectedCount, 10) || 0;
  }

  if (updates.status && updates.status !== crisis.status) {
    updates.timeline = [
      ...(crisis.timeline || []),
      { timestamp: new Date().toISOString(), event: `Status changed to "${updates.status}"`, actor: 'Command Center' }
    ];
  }

  const updated = StoreHelper.updateCrisis(req.params.id, updates);
  return res.json({ success: true, data: updated });
};

const updateStatus = (req, res, next) => {
  const { status } = req.body;
  if (!status) return next(createError('Status is required', 400));
  if (!Object.values(STATUS).includes(status)) {
    return next(createError(`Invalid status. Must be one of: ${Object.values(STATUS).join(', ')}`, 400));
  }

  const crisis = StoreHelper.getCrisisById(req.params.id);
  if (!crisis) return next(createError('Crisis not found', 404));

  const updated = StoreHelper.updateCrisis(req.params.id, {
    status,
    timeline: [
      ...(crisis.timeline || []),
      { timestamp: new Date().toISOString(), event: `Status updated to "${status}"`, actor: 'Command Center' }
    ]
  });

  return res.json({ success: true, data: updated });
};

const addTimelineEvent = (req, res, next) => {
  const { event, actor } = req.body;
  if (!event || !event.trim()) return next(createError('Event description is required', 400));

  const crisis = StoreHelper.getCrisisById(req.params.id);
  if (!crisis) return next(createError('Crisis not found', 404));

  const timelineEntry = {
    timestamp: new Date().toISOString(),
    event: event.trim(),
    actor: actor && actor.trim() ? actor.trim() : 'Unknown'
  };

  const updated = StoreHelper.updateCrisis(req.params.id, {
    timeline: [...(crisis.timeline || []), timelineEntry]
  });

  return res.json({ success: true, data: updated });
};

const deleteCrisis = (req, res, next) => {
  const deleted = StoreHelper.deleteCrisis(req.params.id);
  if (!deleted) return next(createError('Crisis not found', 404));
  return res.json({ success: true, message: 'Crisis deleted successfully' });
};

const getEnums = (req, res) => {
  res.json({ success: true, data: { severity: Object.values(SEVERITY), status: Object.values(STATUS), category: Object.values(CATEGORY) } });
};

module.exports = {
  getAllCrises,
  getCrisisById,
  createCrisis,
  updateCrisis,
  updateStatus,
  addTimelineEvent,
  deleteCrisis,
  getEnums
};
