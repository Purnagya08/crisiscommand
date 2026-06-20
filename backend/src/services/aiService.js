const Groq = require('groq-sdk');

let groqClient = null;

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

const getLocation = (crisis) => (
  crisis && crisis.location && crisis.location.city ? crisis.location.city : 'Unknown'
);

const formatTimeline = (crisis) => (
  (crisis.timeline || [])
    .map((item) => `- ${item.event} (${item.actor}, ${item.timestamp})`)
    .join('\n') || '- No timeline entries'
);

const resourceList = (resources) => (
  resources
    .map((resource) => `- ${resource.name}: ${resource.type}, ${resource.status}, capacity ${resource.capacity}, ${resource.location}, ${resource.specialization}`)
    .join('\n') || '- No resources available'
);

const crisisList = (crises) => (
  crises
    .map((crisis, index) => `${index + 1}. ${crisis.title}: ${crisis.severity}, ${crisis.category}, ${crisis.status}, ${crisis.affectedCount} affected, ${getLocation(crisis)}`)
    .join('\n') || 'No active crises'
);

const systemPrompt = [
  'You are CrisisCommand AI, an emergency-management decision-support assistant.',
  'Give calm, practical, operationally useful guidance.',
  'Do not claim certainty beyond the provided data.',
  'Use clear section headings and concise action-oriented language.',
  'This is software decision support, not a replacement for emergency services or official incident command.'
].join(' ');

const callGroq = async (prompt) => {
  const client = getGroqClient();
  if (!client) throw new Error('GROQ_API_KEY is not configured');

  const completion = await client.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    temperature: 0.25,
    max_tokens: 900,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]
  });

  const content = completion.choices && completion.choices[0] && completion.choices[0].message
    ? completion.choices[0].message.content
    : '';

  if (!content || !content.trim()) throw new Error('Groq returned an empty response');
  return content.trim();
};

const withFallback = async (prompt, fallbackBuilder) => {
  try {
    const text = await callGroq(prompt);
    return { text, provider: 'groq' };
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[AI] Groq unavailable, using fallback: ${error.message}`);
    }
    return { text: fallbackBuilder(), provider: 'fallback' };
  }
};

const buildAnalysisFallback = (crisis, resources) => {
  const deployed = resources.filter((resource) => resource.status === 'deployed').map((resource) => resource.name);
  const available = resources.filter((resource) => resource.status === 'available').map((resource) => resource.name);

  return [
    'SITUATION ASSESSMENT',
    `${crisis.title} is a ${crisis.severity} ${crisis.category} incident in ${getLocation(crisis)} with ${crisis.affectedCount || 0} people affected. Current status is ${crisis.status}.`,
    '',
    'IMMEDIATE ACTIONS',
    '- Confirm latest field conditions and update the incident timeline.',
    '- Protect life safety first, then stabilize critical infrastructure and public access routes.',
    '- Assign a single operations lead and establish a regular update cadence.',
    '',
    'RESOURCE RECOMMENDATIONS',
    `Currently deployed: ${deployed.join(', ') || 'none listed'}. Available for support: ${available.slice(0, 4).join(', ') || 'none listed'}.`,
    '',
    'RISK ESCALATION',
    'Risk increases if communications degrade, affected population grows, or specialized teams are unavailable.',
    '',
    'COMMUNICATION GUIDANCE',
    'Provide concise public instructions, impacted areas, safety guidance, and timing for the next update.',
    '',
    'ESTIMATED RESOLUTION TIME',
    'Use field reports to refine timing; plan for staged stabilization and reassessment.'
  ].join('\n');
};

const buildResourceFallback = ({ crisis, context, resources }) => {
  const available = resources.filter((resource) => resource.status === 'available');
  const standby = resources.filter((resource) => resource.status === 'on_standby');
  const deployed = resources.filter((resource) => resource.status === 'deployed');
  const situation = crisis
    ? `${crisis.title} (${crisis.severity}, ${crisis.category}, ${getLocation(crisis)})`
    : context || 'General emergency situation';

  return [
    'PRIORITY RESOURCES',
    `${available.slice(0, 3).map((resource) => `- ${resource.name}: ${resource.specialization}`).join('\n') || '- No available resources are currently listed.'}`,
    '',
    'ALLOCATION STRATEGY',
    `For ${situation}, deploy the closest relevant available team first, keep a command reserve, and update status immediately after assignment.`,
    '',
    'BACKUP RESOURCES',
    `${standby.slice(0, 3).map((resource) => `- ${resource.name}`).join('\n') || '- No standby resources are currently listed.'}`,
    '',
    'RESOURCE GAPS',
    deployed.length > resources.length / 2
      ? 'Many resources are already deployed. Consider mutual aid or reserve activation.'
      : 'Current inventory has some available capacity. Validate specialty coverage against field needs.',
    '',
    'COORDINATION TIPS',
    'Use one operations lead, shared staging areas, and regular status check-ins.'
  ].join('\n');
};

const buildReportFallback = (crisis) => [
  `SITREP: ${crisis.title}`,
  '',
  'SITUATION OVERVIEW',
  `${crisis.title} is a ${crisis.severity} ${crisis.category} incident in ${getLocation(crisis)} affecting ${crisis.affectedCount || 0} people.`,
  '',
  'CURRENT STATUS',
  `Incident status: ${crisis.status}. Reported by ${crisis.reportedBy || 'Unknown'}.`,
  '',
  'ACTIONS TAKEN',
  formatTimeline(crisis),
  '',
  'ONGOING OPERATIONS',
  `Assigned teams: ${(crisis.assignedTeams || []).join(', ') || 'None assigned'}.`,
  '',
  'NEXT 24-HOUR OBJECTIVES',
  '- Preserve life safety and responder safety.',
  '- Stabilize the incident perimeter and critical services.',
  '- Maintain public communication and operational documentation.',
  '',
  'RECOMMENDATIONS',
  'Continue command updates, verify resource sufficiency, and escalate if severity or affected count increases.'
].join('\n');

const buildPrioritizationFallback = (crises) => {
  if (!crises.length) return 'No active crises to prioritize.';

  const rank = { critical: 4, high: 3, medium: 2, low: 1 };
  const sorted = [...crises].sort((a, b) => {
    const severityDelta = (rank[b.severity] || 0) - (rank[a.severity] || 0);
    if (severityDelta) return severityDelta;
    return Number(b.affectedCount || 0) - Number(a.affectedCount || 0);
  });

  return [
    'PRIORITY RANKING',
    sorted.map((crisis, index) => `${index + 1}. ${crisis.title} - ${crisis.severity}, ${crisis.affectedCount || 0} affected, ${getLocation(crisis)}.`).join('\n'),
    '',
    'CRITICAL DECISION POINT',
    `Immediate command attention should focus on ${sorted[0].title}.`,
    '',
    'RESOURCE REALLOCATION',
    'Protect life safety first, then allocate specialized teams by incident category and proximity.',
    '',
    '30-MINUTE ACTION PLAN',
    'Confirm field status, update all timelines, verify resource assignments, and publish the next operational briefing.'
  ].join('\n');
};

const buildChatFallback = ({ message, context, stats, crises }) => [
  'LOCAL RESPONSE',
  `Current snapshot: ${stats.activeCrises} active crises, ${stats.criticalCrises} critical, ${stats.deployedResources} resources deployed.`,
  context ? `Context: ${context}` : 'No extra context was provided.',
  '',
  'GUIDANCE',
  `For "${message}", verify facts, identify the incident owner, prioritize life safety, assign resources, and document the next update in the timeline.`,
  '',
  'CURRENT ACTIVE INCIDENTS',
  crises.slice(0, 5).map((crisis) => `- ${crisis.title} (${crisis.severity}, ${getLocation(crisis)})`).join('\n') || '- None'
].join('\n');

const analyzeCrisis = async ({ crisis, resources }) => {
  const prompt = [
    'Analyze this crisis and provide these sections:',
    '1. SITUATION ASSESSMENT',
    '2. IMMEDIATE ACTIONS',
    '3. RESOURCE RECOMMENDATIONS',
    '4. RISK ESCALATION',
    '5. COMMUNICATION GUIDANCE',
    '6. ESTIMATED RESOLUTION TIME',
    '',
    `Title: ${crisis.title}`,
    `Category: ${crisis.category}`,
    `Severity: ${crisis.severity}`,
    `Status: ${crisis.status}`,
    `Location: ${getLocation(crisis)}`,
    `Affected People: ${crisis.affectedCount}`,
    `Description: ${crisis.description}`,
    `Reported By: ${crisis.reportedBy}`,
    '',
    'Timeline:',
    formatTimeline(crisis),
    '',
    'Resources:',
    resourceList(resources)
  ].join('\n');

  return withFallback(prompt, () => buildAnalysisFallback(crisis, resources));
};

const recommendResources = async ({ crisis, context, resources }) => {
  const prompt = [
    'Recommend emergency resource allocation with sections:',
    '1. PRIORITY RESOURCES',
    '2. ALLOCATION STRATEGY',
    '3. BACKUP RESOURCES',
    '4. RESOURCE GAPS',
    '5. COORDINATION TIPS',
    '',
    `Situation: ${crisis ? `${crisis.title}, ${crisis.severity}, ${crisis.category}, ${getLocation(crisis)}, ${crisis.affectedCount} affected` : context || 'General emergency situation'}`,
    '',
    'Resources:',
    resourceList(resources)
  ].join('\n');

  return withFallback(prompt, () => buildResourceFallback({ crisis, context, resources }));
};

const generateReport = async ({ crisis }) => {
  const prompt = [
    'Generate a formal emergency management SITREP with sections:',
    'SITUATION OVERVIEW, CURRENT STATUS, ACTIONS TAKEN, ONGOING OPERATIONS, NEXT 24-HOUR OBJECTIVES, RESOURCE STATUS, RECOMMENDATIONS.',
    '',
    `Title: ${crisis.title}`,
    `Category: ${crisis.category}`,
    `Severity: ${crisis.severity}`,
    `Status: ${crisis.status}`,
    `Location: ${getLocation(crisis)}`,
    `Reported: ${crisis.createdAt}`,
    `Affected Population: ${crisis.affectedCount}`,
    `Description: ${crisis.description}`,
    `Assigned Teams: ${(crisis.assignedTeams || []).join(', ') || 'None'}`,
    '',
    'Timeline:',
    formatTimeline(crisis)
  ].join('\n');

  return withFallback(prompt, () => buildReportFallback(crisis));
};

const prioritizeCrises = async ({ crises }) => {
  const prompt = [
    'Prioritize these active crises with sections:',
    '1. PRIORITY RANKING',
    '2. CRITICAL DECISION POINT',
    '3. RESOURCE REALLOCATION',
    '4. 30-MINUTE ACTION PLAN',
    '',
    crisisList(crises)
  ].join('\n');

  return withFallback(prompt, () => buildPrioritizationFallback(crises));
};

const chat = async ({ message, context, stats, crises }) => {
  const prompt = [
    'Answer as an emergency-management chat assistant. Be concise and actionable.',
    '',
    `System Stats: ${stats.activeCrises} active crises, ${stats.criticalCrises} critical crises, ${stats.deployedResources} deployed resources, ${stats.totalAffected} people affected.`,
    '',
    'Recent Crises:',
    crisisList(crises.slice(0, 5)),
    '',
    context ? `Additional Context: ${context}` : '',
    `User Question: ${message}`
  ].join('\n');

  return withFallback(prompt, () => buildChatFallback({ message, context, stats, crises }));
};

module.exports = {
  analyzeCrisis,
  recommendResources,
  generateReport,
  prioritizeCrises,
  chat
};
