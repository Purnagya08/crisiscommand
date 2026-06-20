const { v4: uuidv4 } = require('uuid');
const { StoreHelper } = require('../data/store');
const { createError } = require('../middleware/errorHandler');

const RESOURCE_TYPES   = ['response_team','rescue_team','medical','hazmat','utility','logistics','security','air_support','other'];
const RESOURCE_STATUSES = ['available','deployed','on_standby','unavailable'];

// GET /api/resources
const getAllResources = (req, res) => {
  let resources = StoreHelper.getAllResources();
  if (req.query.type)   resources = resources.filter(r => r.type === req.query.type);
  if (req.query.status) resources = resources.filter(r => r.status === req.query.status);
  res.json({ success: true, count: resources.length, data: resources });
};

// GET /api/resources/:id
const getResourceById = (req, res, next) => {
  const resource = StoreHelper.getResourceById(req.params.id);
  if (!resource) return next(createError('Resource not found', 404));
  res.json({ success: true, data: resource });
};

// POST /api/resources
const createResource = (req, res, next) => {
  const { name, type, capacity, location, contact, specialization } = req.body;
  if (!name || !type) return next(createError('name and type are required', 400));
  if (!RESOURCE_TYPES.includes(type)) return next(createError(`Invalid type. Options: ${RESOURCE_TYPES.join(', ')}`, 400));

  const resource = {
    id            : uuidv4(),
    name          : name.trim(),
    type,
    status        : 'available',
    capacity      : parseInt(capacity) || 10,
    location      : location?.trim() || 'Unknown',
    contact       : contact?.trim() || '',
    specialization: specialization?.trim() || 'General',
    createdAt     : new Date().toISOString(),
  };

  StoreHelper.addResource(resource);
  res.status(201).json({ success: true, data: resource });
};

// PATCH /api/resources/:id/status
const updateResourceStatus = (req, res, next) => {
  const { status } = req.body;
  if (!status) return next(createError('status is required', 400));
  if (!RESOURCE_STATUSES.includes(status)) return next(createError(`Invalid status. Options: ${RESOURCE_STATUSES.join(', ')}`, 400));

  const resource = StoreHelper.getResourceById(req.params.id);
  if (!resource) return next(createError('Resource not found', 404));

  const updated = StoreHelper.updateResource(req.params.id, { status });
  res.json({ success: true, data: updated });
};

// PUT /api/resources/:id
const updateResource = (req, res, next) => {
  const resource = StoreHelper.getResourceById(req.params.id);
  if (!resource) return next(createError('Resource not found', 404));

  const allowedFields = ['name','type','status','capacity','location','contact','specialization'];
  const updates = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const updated = StoreHelper.updateResource(req.params.id, updates);
  res.json({ success: true, data: updated });
};

// GET /api/resources/meta/types
const getResourceTypes = (req, res) => {
  res.json({ success: true, data: { types: RESOURCE_TYPES, statuses: RESOURCE_STATUSES } });
};

module.exports = { getAllResources, getResourceById, createResource, updateResourceStatus, updateResource, getResourceTypes };
