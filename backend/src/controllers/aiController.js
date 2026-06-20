const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const { StoreHelper } = require('../data/store');
const { createError } = require('../middleware/errorHandler');

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) throw createError('GEMINI_API_KEY is not configured', 500);
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const callGemini = async (prompt) => {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// POST /api/ai/analyze/:crisisId
const analyzeCrisis = async (req, res, next) => {
  try {
    const crisis = StoreHelper.getCrisisById(req.params.crisisId);
    if (!crisis) return next(createError('Crisis not found', 404));

    const prompt = `
You are an emergency management AI assistant. Analyze the following crisis and provide a structured response.

CRISIS DETAILS:
- Title: ${crisis.title}
- Category: ${crisis.category}
- Severity: ${crisis.severity}
- Status: ${crisis.status}
- Location: ${crisis.location?.city || 'Unknown'}
- Affected People: ${crisis.affectedCount}
- Description: ${crisis.description}
- Reported By: ${crisis.reportedBy}
- Timeline Events: ${crisis.timeline?.map(t => `${t.event} (${t.actor})`).join('; ') || 'None'}

Provide a comprehensive crisis analysis with the following sections:
1. SITUATION ASSESSMENT (2-3 sentences about current state and risk level)
2. IMMEDIATE ACTIONS (3-5 specific actions to take in the next 2 hours)
3. RESOURCE RECOMMENDATIONS (specific teams/resources needed)
4. RISK ESCALATION (what could make this worse and probability)
5. COMMUNICATION GUIDANCE (what to tell the public and stakeholders)
6. ESTIMATED RESOLUTION TIME (realistic timeline)

Format your response clearly with section headers. Be specific, actionable, and concise.
`;

    const responseText = await callGemini(prompt);
    const analysis = { prompt, response: responseText, timestamp: new Date().toISOString() };

    StoreHelper.updateCrisis(crisis.id, { aiAnalysis: analysis });
    StoreHelper.addAiLog({ id: uuidv4(), crisisId: crisis.id, type: 'crisis_analysis', ...analysis });

    res.json({ success: true, data: { crisisId: crisis.id, analysis: responseText, timestamp: analysis.timestamp } });
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/recommend-resources
const recommendResources = async (req, res, next) => {
  try {
    const { crisisId } = req.body;
    const crisis    = crisisId ? StoreHelper.getCrisisById(crisisId) : null;
    const resources = StoreHelper.getAllResources();

    const crisisContext = crisis
      ? `Crisis: ${crisis.title} | Severity: ${crisis.severity} | Category: ${crisis.category} | Affected: ${crisis.affectedCount} people`
      : req.body.context || 'General emergency situation';

    const availableResources = resources.filter(r => r.status !== 'unavailable');

    const prompt = `
You are an emergency resource allocation AI. Recommend optimal resource allocation.

SITUATION: ${crisisContext}

AVAILABLE RESOURCES:
${availableResources.map(r => `- ${r.name} (Type: ${r.type}, Status: ${r.status}, Capacity: ${r.capacity}, Specialization: ${r.specialization})`).join('\n')}

Provide resource recommendations:
1. PRIORITY RESOURCES (list top 3 most critical resources to deploy and why)
2. ALLOCATION STRATEGY (how to distribute resources effectively)
3. BACKUP RESOURCES (what to have on standby)
4. RESOURCE GAPS (what additional resources are needed that aren't available)
5. COORDINATION TIPS (how teams should work together)

Be specific and reference resources by name.
`;

    const responseText = await callGemini(prompt);
    StoreHelper.addAiLog({ id: uuidv4(), crisisId: crisisId || null, type: 'resource_recommendation', prompt, response: responseText, timestamp: new Date().toISOString() });

    res.json({ success: true, data: { recommendations: responseText, timestamp: new Date().toISOString() } });
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/generate-report
const generateReport = async (req, res, next) => {
  try {
    const { crisisId } = req.body;
    const crisis = crisisId ? StoreHelper.getCrisisById(crisisId) : null;
    if (!crisis) return next(createError('Crisis not found', 404));

    const prompt = `
Generate a formal emergency management situation report (SITREP) for:

CRISIS: ${crisis.title}
Category: ${crisis.category} | Severity: ${crisis.severity} | Status: ${crisis.status}
Location: ${crisis.location?.city || 'Unknown'}
Reported: ${crisis.createdAt}
Affected Population: ${crisis.affectedCount}
Description: ${crisis.description}
Assigned Teams: ${crisis.assignedTeams?.join(', ') || 'None'}

Timeline:
${crisis.timeline?.map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.event} — ${t.actor}`).join('\n') || 'No timeline entries'}

Write a professional SITREP report including:
- SITUATION OVERVIEW
- CURRENT STATUS
- ACTIONS TAKEN
- ONGOING OPERATIONS
- NEXT 24-HOUR OBJECTIVES
- RESOURCE STATUS
- RECOMMENDATIONS

Use formal emergency management language. Keep it concise but complete.
`;

    const responseText = await callGemini(prompt);
    StoreHelper.addAiLog({ id: uuidv4(), crisisId: crisis.id, type: 'sitrep_report', prompt, response: responseText, timestamp: new Date().toISOString() });

    res.json({ success: true, data: { report: responseText, crisisId: crisis.id, generatedAt: new Date().toISOString() } });
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/chat
const chat = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    if (!message) return next(createError('Message is required', 400));

    const stats  = StoreHelper.getStats();
    const crises = StoreHelper.getAllCrises().slice(0, 5);

    const prompt = `
You are CrisisCommand AI — an expert emergency management assistant.
You help operators manage crises, allocate resources, and make decisions.

CURRENT SYSTEM OVERVIEW:
- Total Active Crises: ${stats.activeCrises}
- Critical Crises: ${stats.criticalCrises}
- Deployed Resources: ${stats.deployedResources}
- Total Affected People: ${stats.totalAffected}

RECENT CRISES:
${crises.map(c => `- ${c.title} [${c.severity.toUpperCase()}] [${c.status.toUpperCase()}] — ${c.location?.city}`).join('\n')}

${context ? `ADDITIONAL CONTEXT: ${context}` : ''}

USER QUESTION: ${message}

Respond as a knowledgeable, calm emergency management expert. Be concise, practical, and actionable.
If you don't have enough information, ask for clarification. Keep responses under 200 words unless a detailed plan is needed.
`;

    const responseText = await callGemini(prompt);
    StoreHelper.addAiLog({ id: uuidv4(), crisisId: null, type: 'chat', prompt: message, response: responseText, timestamp: new Date().toISOString() });

    res.json({ success: true, data: { reply: responseText, timestamp: new Date().toISOString() } });
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/prioritize
const prioritizeCrises = async (req, res, next) => {
  try {
    const crises = StoreHelper.getAllCrises().filter(c => c.status === 'active');
    if (crises.length === 0) return res.json({ success: true, data: { prioritization: 'No active crises to prioritize.', timestamp: new Date().toISOString() } });

    const prompt = `
You are an emergency management prioritization AI.

ACTIVE CRISES TO PRIORITIZE:
${crises.map((c, i) => `${i + 1}. ${c.title}
   - Severity: ${c.severity} | Category: ${c.category}
   - Affected: ${c.affectedCount} people | Location: ${c.location?.city}
   - Description: ${c.description}`).join('\n\n')}

Create a prioritization plan:
1. PRIORITY RANKING (rank crises 1 to ${crises.length} with justification)
2. CRITICAL DECISION POINT (which crisis needs immediate command attention)
3. RESOURCE REALLOCATION (if resources must be shared, how to split them)
4. 30-MINUTE ACTION PLAN (what to do right now across all crises)

Be decisive and clear. Lives depend on correct prioritization.
`;

    const responseText = await callGemini(prompt);
    StoreHelper.addAiLog({ id: uuidv4(), crisisId: null, type: 'prioritization', prompt, response: responseText, timestamp: new Date().toISOString() });

    res.json({ success: true, data: { prioritization: responseText, activeCrisesCount: crises.length, timestamp: new Date().toISOString() } });
  } catch (err) {
    next(err);
  }
};

// GET /api/ai/logs
const getAiLogs = (req, res) => {
  const logs = StoreHelper.getAiLogs();
  res.json({ success: true, count: logs.length, data: logs });
};

module.exports = { analyzeCrisis, recommendResources, generateReport, chat, prioritizeCrises, getAiLogs };
