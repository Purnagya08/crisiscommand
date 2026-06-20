const { createError } = require('./errorHandler');

/**
 * Validates required fields exist in req.body
 * Usage: validate(['title','severity','category'])
 */
const validate = (requiredFields) => (req, res, next) => {
  const missing = requiredFields.filter(f => req.body[f] === undefined || req.body[f] === '');
  if (missing.length > 0) {
    return next(createError(`Missing required fields: ${missing.join(', ')}`, 400));
  }
  next();
};

module.exports = { validate };
