const { v4: uuidv4 } = require('uuid');
const { StoreHelper, RESOURCE_TYPES, RESOURCE_STATUSES } = require('../data/store');
const { createError } = require('../middleware/errorHandler');

const getAllResources = (req, res) => {
  let resources = [...StoreHelper.getAllResources()];
  const { type, status, search } = req.query;

  if (type) resources = resources.filter((resource) => resource.type === type);
  if (status) resources = resources.filter((resource) => resource.status === status);
  if (search) {
    const query = search.toLowerCase();
    resources = resources.filter((resource) => (
      resource.name.toLowerCase().includes(query) ||
      resource.location.toLowerCase().includes(query) ||
      resource.specialization.toLowerCase().includes(query)
    ));
  }

  res.json({ success: true, count: resources.length, data: resources });
};

const getResourceById = (req, res, next) => {
  const resource = StoreHelper.getResourceById(req.params.id);
  if (!resource) return next(createError('Resource not found', 404));
  return res.json({ success: true, data: resource });
};

const createResource = (req, res, next) => {
  const { name, type, status, capacity, location, contact, specialization } = req.body;

  if (!RESOURCE_TYPES.includes(type)) {
    return next(createError(`Invalid resource type. Must be one of: ${RESOURCE_TYPES.join(', ')}`, 400));
  }

  if (status && !RESOURCE_STATUSES.includes(status)) {
    return next(createError(`Invalid resource status. Must be one of: ${RESOURCE_STATUSES.join(', ')}`, 400));
  }

  const timestamp = new Date().toISOString();
  const resource = {
    id: uuidv4(),
    name: name.trim(),
    type,
    status: status || 'available',
    capacity: Number.parseInt(capacity, 10) || 1,
    location: location && location.trim() ? location.trim() : 'Unknown',
    contact: contact && contact.trim() ? contact.trim() : '',
    specialization: specialization && specialization.trim() ? specialization.trim() : 'General',
    createdAt: timestamp,
    updatedAt: timestamp
  };

  StoreHelper.addResource(resource);
  return res.status(201).json({ success: true, data: resource });
};

const updateResource = (req, res, next) => {
  const resource = StoreHelper.getResourceById(req.params.id);
  if (!resource) return next(createError('Resource not found', 404));

  const allowedFields = ['name', 'type', 'status', 'capacity', 'location', 'contact', 'specialization'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (updates.type && !RESOURCE_TYPES.includes(updates.type)) {
    return next(createError(`Invalid resource type. Must be one of: ${RESOURCE_TYPES.join(', ')}`, 400));
  }

  if (updates.status && !RESOURCE_STATUSES.includes(updates.status)) {
    return next(createError(`Invalid resource status. Must be one of: ${RESOURCE_STATUSES.join(', ')}`, 400));
  }

  if (updates.capacity !== undefined) {
    updates.capacity = Number.parseInt(updates.capacity, 10) || 1;
  }

  const updated = StoreHelper.updateResource(req.params.id, updates);
  return res.json({ success: true, data: updated });
};

const updateResourceStatus = (req, res, next) => {
  const { status } = req.body;
  if (!status) return next(createError('Status is required', 400));
  if (!RESOURCE_STATUSES.includes(status)) {
    return next(createError(`Invalid resource status. Must be one of: ${RESOURCE_STATUSES.join(', ')}`, 400));
  }

  const resource = StoreHelper.getResourceById(req.params.id);
  if (!resource) return next(createError('Resource not found', 404));

  const updated = StoreHelper.updateResource(req.params.id, { status });
  return res.json({ success: true, data: updated });
};

const deleteResource = (req, res, next) => {
  const deleted = StoreHelper.deleteResource(req.params.id);
  if (!deleted) return next(createError('Resource not found', 404));
  return res.json({ success: true, message: 'Resource deleted successfully' });
};

const getResourceTypes = (req, res) => {
  res.json({ success: true, data: { types: RESOURCE_TYPES, statuses: RESOURCE_STATUSES } });
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  updateResourceStatus,
  deleteResource,
  getResourceTypes
};
