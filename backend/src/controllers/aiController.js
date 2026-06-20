const { v4: uuidv4 } = require('uuid');
const { StoreHelper } = require('../data/store');
const { createError } = require('../middleware/errorHandler');

const timestamp = () => new Date().toISOString();

const logAiInteraction = ({ type, crisisId = null, prompt, response }) => {
  return StoreHelper.addAiLog({
    id: uuidv4(),
    type,
    crisisId,
    prompt,
    response,
    timestamp: timestamp()
  });
};

const summarizeResources = () => {
  const resources = StoreHelper.getAllResources();
  const available = resources.filter((resource) => resource.status === 'available');
  const standby = resources.filter((resource) => resource.status === 'on_standby');
  return { resources, available, standby };
};

const analyzeCrisis = (req, res, next) => {
  const crisis = StoreHelper.getCrisisById(req.params.crisisId);
  if (!crisis) return next(createError('Crisis not found', 404));

  const prompt = `Analyze crisis: ${crisis.title}`;
  const response = [
    `Situation Assessment: ${crisis.title} is a ${crisis.severity} ${crisis.category} incident in ${crisis.location && crisis.location.city ? crisis.location.city : 'an unknown location'}.`,
    `Immediate Actions: maintain command visibility, verify field conditions, protect affected civilians, and keep assigned teams coordinated.`,
    `Resource Recommendations: review assigned teams (${(crisis.assignedTeams || []).join(', ') || 'none assigned'}) and deploy available support if conditions worsen.`,
    `Communication Guidance: provide calm public updates with location, safety instructions, and next update timing.`,
    `Estimated Resolution Time: depends on field reports and resource availability.`
  ].join('\n\n');

  const analysis = { prompt, response, timestamp: timestamp(), mode: 'local_stub' };
  StoreHelper.updateCrisis(crisis.id, { aiAnalysis: analysis });
  logAiInteraction({ type: 'crisis_analysis', crisisId: crisis.id, prompt, response });

  return res.json({
    success: true,
    data: { crisisId: crisis.id, analysis: response, timestamp: analysis.timestamp, mode: 'local_stub' }
  });
};

const recommendResources = (req, res) => {
  const crisis = req.body.crisisId ? StoreHelper.getCrisisById(req.body.crisisId) : null;
  const context = crisis ? `${crisis.title} (${crisis.severity})` : (req.body.context || 'General emergency situation');
  const { available, standby } = summarizeResources();

  const response = [
    `Resource Context: ${context}`,
    `Priority Resources: ${available.slice(0, 3).map((resource) => resource.name).join(', ') || 'No available resources currently listed'}.`,
    `Standby Resources: ${standby.slice(0, 3).map((resource) => resource.name).join(', ') || 'No standby resources currently listed'}.`,
    'Allocation Strategy: deploy closest relevant teams first, preserve backup capacity, and update resource status after assignment.',
    'Resource Gaps: add missing specialty teams if the incident requires capabilities not listed in the resource inventory.'
  ].join('\n\n');

  logAiInteraction({ type: 'resource_recommendation', crisisId: crisis ? crisis.id : null, prompt: context, response });
  res.json({ success: true, data: { recommendations: response, timestamp: timestamp(), mode: 'local_stub' } });
};

const generateReport = (req, res, next) => {
  const crisis = StoreHelper.getCrisisById(req.body.crisisId);
  if (!crisis) return next(createError('Crisis not found', 404));

  const response = [
    `SITREP: ${crisis.title}`,
    `Status: ${crisis.status}`,
    `Severity: ${crisis.severity}`,
    `Location: ${crisis.location && crisis.location.city ? crisis.location.city : 'Unknown'}`,
    `Affected Population: ${crisis.affectedCount}`,
    `Actions Taken: ${(crisis.timeline || []).map((item) => item.event).join('; ') || 'No timeline entries available.'}`,
    `Assigned Teams: ${(crisis.assignedTeams || []).join(', ') || 'No teams assigned.'}`,
    'Next Objectives: stabilize the incident, maintain public communications, and update the timeline as conditions change.'
  ].join('\n\n');

  logAiInteraction({ type: 'sitrep_report', crisisId: crisis.id, prompt: `Generate SITREP for ${crisis.title}`, response });
  return res.json({ success: true, data: { report: response, crisisId: crisis.id, generatedAt: timestamp(), mode: 'local_stub' } });
};

const chat = (req, res, next) => {
  const { message, context } = req.body;
  if (!message || !message.trim()) return next(createError('Message is required', 400));

  const stats = StoreHelper.getStats();
  const response = [
    `I am running in local stub mode for now.`,
    `Current snapshot: ${stats.activeCrises} active crises, ${stats.criticalCrises} critical crises, ${stats.deployedResources} resources deployed.`,
    context ? `Context noted: ${context}` : 'No extra context was provided.',
    `For your question "${message.trim()}", start by confirming incident facts, assigning an owner, and updating the command timeline.`
  ].join('\n\n');

  logAiInteraction({ type: 'chat', prompt: message.trim(), response });
  return res.json({ success: true, data: { reply: response, timestamp: timestamp(), mode: 'local_stub' } });
};

const prioritizeCrises = (req, res) => {
  const activeCrises = StoreHelper.getAllCrises().filter((crisis) => crisis.status === 'active');
  const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };

  if (activeCrises.length === 0) {
    const response = 'No active crises to prioritize.';
    logAiInteraction({ type: 'prioritization', prompt: 'Prioritize active crises', response });
    return res.json({ success: true, data: { prioritization: response, activeCrisesCount: 0, timestamp: timestamp(), mode: 'local_stub' } });
  }

  const ranked = [...activeCrises].sort((a, b) => {
    const severityDelta = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
    if (severityDelta !== 0) return severityDelta;
    return Number(b.affectedCount || 0) - Number(a.affectedCount || 0);
  });

  const response = ranked.map((crisis, index) => (
    `${index + 1}. ${crisis.title} - ${crisis.severity} severity, ${crisis.affectedCount} affected, status ${crisis.status}.`
  )).join('\n');

  const finalResponse = `${response}\n\nImmediate Plan: focus command attention on the top-ranked incident, confirm resource coverage, and update all active timelines within 30 minutes.`;
  logAiInteraction({ type: 'prioritization', prompt: 'Prioritize active crises', response: finalResponse });

  return res.json({
    success: true,
    data: { prioritization: finalResponse, activeCrisesCount: activeCrises.length, timestamp: timestamp(), mode: 'local_stub' }
  });
};

const getAiLogs = (req, res) => {
  const logs = StoreHelper.getAiLogs();
  res.json({ success: true, count: logs.length, data: logs });
};

module.exports = {
  analyzeCrisis,
  recommendResources,
  generateReport,
  chat,
  prioritizeCrises,
  getAiLogs
};
