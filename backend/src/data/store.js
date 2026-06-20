/**
 * In-Memory Data Store
 * Centralized storage for all runtime data.
 * Resets on server restart — no persistence.
 */

const { v4: uuidv4 } = require('uuid');

// ─── Crisis Severity Levels ──────────────────────────────────────────────
const SEVERITY = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high', CRITICAL: 'critical' };
const STATUS   = { ACTIVE: 'active', CONTAINED: 'contained', RESOLVED: 'resolved' };
const CATEGORY = {
  NATURAL_DISASTER : 'natural_disaster',
  INFRASTRUCTURE   : 'infrastructure',
  PUBLIC_HEALTH    : 'public_health',
  SECURITY         : 'security',
  ENVIRONMENTAL    : 'environmental',
  OTHER            : 'other',
};

// ─── Seed Data ────────────────────────────────────────────────────────────
const seedCrises = [
  {
    id: uuidv4(),
    title: 'Downtown Power Outage',
    description: 'Major power outage affecting 5 city blocks. Critical infrastructure impacted.',
    category: CATEGORY.INFRASTRUCTURE,
    severity: SEVERITY.HIGH,
    status: STATUS.ACTIVE,
    location: { city: 'Metro City', coordinates: { lat: 40.7128, lng: -74.006 } },
    affectedCount: 12500,
    reportedBy: 'City Grid Authority',
    assignedTeams: ['Emergency Response Alpha', 'Power Utility Team'],
    timeline: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), event: 'Outage detected', actor: 'System' },
      { timestamp: new Date(Date.now() - 3000000).toISOString(), event: 'Response team dispatched', actor: 'Command Center' },
    ],
    aiAnalysis: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Flooding in Riverside District',
    description: 'Severe flooding after 48h rainfall. Evacuation underway.',
    category: CATEGORY.NATURAL_DISASTER,
    severity: SEVERITY.CRITICAL,
    status: STATUS.ACTIVE,
    location: { city: 'Riverside', coordinates: { lat: 34.0522, lng: -118.2437 } },
    affectedCount: 8200,
    reportedBy: 'Riverside Emergency Services',
    assignedTeams: ['Rescue Team Bravo', 'Medical Unit 3', 'Evacuation Team'],
    timeline: [
      { timestamp: new Date(Date.now() - 7200000).toISOString(), event: 'Flood warning issued', actor: 'Weather Service' },
      { timestamp: new Date(Date.now() - 5400000).toISOString(), event: 'Evacuation order activated', actor: 'Mayor Office' },
    ],
    aiAnalysis: null,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Chemical Spill — Industrial Zone',
    description: 'Minor chemical spill at Factory B. Hazmat team on site.',
    category: CATEGORY.ENVIRONMENTAL,
    severity: SEVERITY.MEDIUM,
    status: STATUS.CONTAINED,
    location: { city: 'Industrial Park', coordinates: { lat: 41.8781, lng: -87.6298 } },
    affectedCount: 340,
    reportedBy: 'Factory B Safety Officer',
    assignedTeams: ['Hazmat Delta'],
    timeline: [
      { timestamp: new Date(Date.now() - 1800000).toISOString(), event: 'Spill reported', actor: 'Safety Officer' },
      { timestamp: new Date(Date.now() - 900000).toISOString(), event: 'Hazmat team arrived', actor: 'Hazmat Delta' },
      { timestamp: new Date(Date.now() - 300000).toISOString(), event: 'Spill contained', actor: 'Hazmat Delta' },
    ],
    aiAnalysis: null,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedResources = [
  { id: uuidv4(), name: 'Emergency Response Alpha', type: 'response_team', status: 'deployed',    capacity: 25, location: 'Downtown',        contact: 'alpha@emergency.gov',   specialization: 'General Emergency' },
  { id: uuidv4(), name: 'Rescue Team Bravo',        type: 'rescue_team',   status: 'deployed',    capacity: 20, location: 'Riverside',         contact: 'bravo@emergency.gov',   specialization: 'Water Rescue' },
  { id: uuidv4(), name: 'Medical Unit 3',           type: 'medical',       status: 'deployed',    capacity: 15, location: 'Riverside',         contact: 'med3@health.gov',       specialization: 'Emergency Medicine' },
  { id: uuidv4(), name: 'Hazmat Delta',             type: 'hazmat',        status: 'on_standby',  capacity: 12, location: 'Industrial Park',   contact: 'delta@hazmat.gov',      specialization: 'Chemical Hazards' },
  { id: uuidv4(), name: 'Power Utility Team',       type: 'utility',       status: 'deployed',    capacity: 30, location: 'Downtown',          contact: 'power@utility.gov',     specialization: 'Electrical Systems' },
  { id: uuidv4(), name: 'Evacuation Team',          type: 'logistics',     status: 'deployed',    capacity: 50, location: 'Riverside',         contact: 'evac@logistics.gov',    specialization: 'Mass Evacuation' },
  { id: uuidv4(), name: 'Cyber Security Unit',      type: 'security',      status: 'available',   capacity: 8,  location: 'Command Center',    contact: 'cyber@security.gov',    specialization: 'Digital Infrastructure' },
  { id: uuidv4(), name: 'Air Support Echo',         type: 'air_support',   status: 'available',   capacity: 6,  location: 'City Airport',      contact: 'echo@airsupport.gov',   specialization: 'Aerial Surveillance & Rescue' },
];

// ─── The Store ────────────────────────────────────────────────────────────
const store = {
  crises   : [...seedCrises],
  resources: [...seedResources],
  aiLogs   : [],          // {id, crisisId, prompt, response, timestamp}
  alerts   : [],          // {id, message, severity, crisisId, timestamp, read}
};

// ─── Store Helpers ────────────────────────────────────────────────────────
const StoreHelper = {
  // Crisis CRUD
  getAllCrises  : ()       => store.crises,
  getCrisisById : (id)     => store.crises.find(c => c.id === id) || null,
  addCrisis     : (crisis) => { store.crises.unshift(crisis); return crisis; },
  updateCrisis  : (id, updates) => {
    const idx = store.crises.findIndex(c => c.id === id);
    if (idx === -1) return null;
    store.crises[idx] = { ...store.crises[idx], ...updates, updatedAt: new Date().toISOString() };
    return store.crises[idx];
  },
  deleteCrisis  : (id) => {
    const idx = store.crises.findIndex(c => c.id === id);
    if (idx === -1) return false;
    store.crises.splice(idx, 1);
    return true;
  },

  // Resource CRUD
  getAllResources  : ()           => store.resources,
  getResourceById : (id)         => store.resources.find(r => r.id === id) || null,
  addResource     : (resource)   => { store.resources.push(resource); return resource; },
  updateResource  : (id, updates) => {
    const idx = store.resources.findIndex(r => r.id === id);
    if (idx === -1) return null;
    store.resources[idx] = { ...store.resources[idx], ...updates };
    return store.resources[idx];
  },

  // AI Logs
  addAiLog : (log) => { store.aiLogs.unshift(log); if (store.aiLogs.length > 100) store.aiLogs.pop(); return log; },
  getAiLogs: ()    => store.aiLogs,

  // Alerts
  addAlert    : (alert) => { store.alerts.unshift(alert); if (store.alerts.length > 200) store.alerts.pop(); return alert; },
  getAlerts   : ()      => store.alerts,
  markAlertRead: (id)   => {
    const a = store.alerts.find(a => a.id === id);
    if (a) a.read = true;
    return a;
  },

  // Analytics snapshot
  getStats: () => ({
    totalCrises     : store.crises.length,
    activeCrises    : store.crises.filter(c => c.status === STATUS.ACTIVE).length,
    containedCrises : store.crises.filter(c => c.status === STATUS.CONTAINED).length,
    resolvedCrises  : store.crises.filter(c => c.status === STATUS.RESOLVED).length,
    criticalCrises  : store.crises.filter(c => c.severity === SEVERITY.CRITICAL).length,
    totalResources  : store.resources.length,
    deployedResources   : store.resources.filter(r => r.status === 'deployed').length,
    availableResources  : store.resources.filter(r => r.status === 'available').length,
    totalAffected   : store.crises.reduce((sum, c) => sum + (c.affectedCount || 0), 0),
    aiAnalysesRun   : store.aiLogs.length,
    categoryBreakdown: Object.values(CATEGORY).map(cat => ({
      category: cat,
      count: store.crises.filter(c => c.category === cat).length,
    })),
    severityBreakdown: Object.values(SEVERITY).map(sev => ({
      severity: sev,
      count: store.crises.filter(c => c.severity === sev).length,
    })),
  }),
};

module.exports = { store, StoreHelper, SEVERITY, STATUS, CATEGORY };
