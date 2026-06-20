const { v4: uuidv4 } = require('uuid');
const { StoreHelper } = require('../data/store');
const { createError } = require('../middleware/errorHandler');
const aiService = require('../services/aiService');

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

const analyzeCrisis = async (req, res, next) => {
  const crisis = StoreHelper.getCrisisById(req.params.crisisId);
  if (!crisis) return next(createError('Crisis not found', 404));

  const prompt = `Analyze crisis: ${crisis.title}`;
  const result = await aiService.analyzeCrisis({
    crisis,
    resources: StoreHelper.getAllResources()
  });
  const response = result.text;

  const analysis = { prompt, response, timestamp: timestamp(), provider: result.provider };
  StoreHelper.updateCrisis(crisis.id, { aiAnalysis: analysis });
  logAiInteraction({ type: 'crisis_analysis', crisisId: crisis.id, prompt, response });

  return res.json({
    success: true,
    data: { crisisId: crisis.id, analysis: response, timestamp: analysis.timestamp }
  });
};

const recommendResources = async (req, res) => {
  const crisis = req.body.crisisId ? StoreHelper.getCrisisById(req.body.crisisId) : null;
  const context = crisis ? `${crisis.title} (${crisis.severity})` : (req.body.context || 'General emergency situation');
  const result = await aiService.recommendResources({
    crisis,
    context,
    resources: StoreHelper.getAllResources()
  });
  const response = result.text;

  logAiInteraction({ type: 'resource_recommendation', crisisId: crisis ? crisis.id : null, prompt: context, response });
  res.json({ success: true, data: { recommendations: response, timestamp: timestamp() } });
};

const generateReport = async (req, res, next) => {
  const crisis = StoreHelper.getCrisisById(req.body.crisisId);
  if (!crisis) return next(createError('Crisis not found', 404));

  const result = await aiService.generateReport({ crisis });
  const response = result.text;

  logAiInteraction({ type: 'sitrep_report', crisisId: crisis.id, prompt: `Generate SITREP for ${crisis.title}`, response });
  return res.json({ success: true, data: { report: response, crisisId: crisis.id, generatedAt: timestamp() } });
};

const chat = async (req, res, next) => {
  const { message, context } = req.body;
  if (!message || !message.trim()) return next(createError('Message is required', 400));

  const stats = StoreHelper.getStats();
  const result = await aiService.chat({
    message: message.trim(),
    context,
    stats,
    crises: StoreHelper.getAllCrises()
  });
  const response = result.text;

  logAiInteraction({ type: 'chat', prompt: message.trim(), response });
  return res.json({ success: true, data: { reply: response, timestamp: timestamp() } });
};

const prioritizeCrises = async (req, res) => {
  const activeCrises = StoreHelper.getAllCrises().filter((crisis) => crisis.status === 'active');
  const result = await aiService.prioritizeCrises({ crises: activeCrises });
  const finalResponse = result.text;
  logAiInteraction({ type: 'prioritization', prompt: 'Prioritize active crises', response: finalResponse });

  return res.json({
    success: true,
    data: { prioritization: finalResponse, activeCrisesCount: activeCrises.length, timestamp: timestamp() }
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
