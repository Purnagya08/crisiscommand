const { v4: uuidv4 } = require('uuid');

const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const STATUS = {
  ACTIVE: 'active',
  CONTAINED: 'contained',
  RESOLVED: 'resolved'
};

const CATEGORY = {
  NATURAL_DISASTER: 'natural_disaster',
  INFRASTRUCTURE: 'infrastructure',
  PUBLIC_HEALTH: 'public_health',
  SECURITY: 'security',
  ENVIRONMENTAL: 'environmental',
  OTHER: 'other'
};

const RESOURCE_TYPES = [
  'response_team',
  'rescue_team',
  'medical',
  'hazmat',
  'utility',
  'logistics',
  'security',
  'air_support',
  'other'
];

const RESOURCE_STATUSES = ['available', 'deployed', 'on_standby', 'unavailable'];

const now = () => new Date().toISOString();
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const store = {
  crises: [
    {
      id: uuidv4(),
      title: 'Downtown Power Outage',
      description: 'Major power outage affecting five city blocks and several critical intersections.',
      category: CATEGORY.INFRASTRUCTURE,
      severity: SEVERITY.HIGH,
      status: STATUS.ACTIVE,
      location: { city: 'Metro City', coordinates: { lat: 40.7128, lng: -74.0060 } },
      affectedCount: 12500,
      reportedBy: 'City Grid Authority',
      assignedTeams: ['Emergency Response Alpha', 'Power Utility Team'],
      timeline: [
        { timestamp: hoursAgo(3), event: 'Outage detected by grid monitoring system', actor: 'System' },
        { timestamp: hoursAgo(2.5), event: 'Power Utility Team dispatched', actor: 'Command Center' }
      ],
      aiAnalysis: null,
      createdAt: hoursAgo(3),
      updatedAt: hoursAgo(2.5)
    },
    {
      id: uuidv4(),
      title: 'Flooding in Riverside District',
      description: 'Severe flooding after heavy rainfall. Evacuation support is underway.',
      category: CATEGORY.NATURAL_DISASTER,
      severity: SEVERITY.CRITICAL,
      status: STATUS.ACTIVE,
      location: { city: 'Riverside', coordinates: { lat: 34.0522, lng: -118.2437 } },
      affectedCount: 8200,
      reportedBy: 'Riverside Emergency Services',
      assignedTeams: ['Rescue Team Bravo', 'Medical Unit 3', 'Evacuation Team'],
      timeline: [
        { timestamp: hoursAgo(5), event: 'Flood warning issued', actor: 'Weather Service' },
        { timestamp: hoursAgo(4), event: 'Evacuation order activated', actor: 'Mayor Office' }
      ],
      aiAnalysis: null,
      createdAt: hoursAgo(5),
      updatedAt: hoursAgo(4)
    },
    {
      id: uuidv4(),
      title: 'Chemical Spill in Industrial Zone',
      description: 'Contained chemical spill at Factory B. Hazmat team remains on site for monitoring.',
      category: CATEGORY.ENVIRONMENTAL,
      severity: SEVERITY.MEDIUM,
      status: STATUS.CONTAINED,
      location: { city: 'Industrial Park', coordinates: { lat: 41.8781, lng: -87.6298 } },
      affectedCount: 340,
      reportedBy: 'Factory B Safety Officer',
      assignedTeams: ['Hazmat Delta'],
      timeline: [
        { timestamp: hoursAgo(1.5), event: 'Spill reported', actor: 'Safety Officer' },
        { timestamp: hoursAgo(1), event: 'Hazmat Delta arrived on scene', actor: 'Hazmat Delta' },
        { timestamp: hoursAgo(0.5), event: 'Spill contained', actor: 'Hazmat Delta' }
      ],
      aiAnalysis: null,
      createdAt: hoursAgo(1.5),
      updatedAt: hoursAgo(0.5)
    }
  ],
  resources: [
    { id: uuidv4(), name: 'Emergency Response Alpha', type: 'response_team', status: 'deployed', capacity: 25, location: 'Downtown', contact: 'alpha@emergency.gov', specialization: 'General emergency response', createdAt: hoursAgo(24), updatedAt: hoursAgo(2.5) },
    { id: uuidv4(), name: 'Rescue Team Bravo', type: 'rescue_team', status: 'deployed', capacity: 20, location: 'Riverside', contact: 'bravo@emergency.gov', specialization: 'Water rescue', createdAt: hoursAgo(24), updatedAt: hoursAgo(4) },
    { id: uuidv4(), name: 'Medical Unit 3', type: 'medical', status: 'deployed', capacity: 15, location: 'Riverside', contact: 'med3@health.gov', specialization: 'Emergency medicine', createdAt: hoursAgo(24), updatedAt: hoursAgo(4) },
    { id: uuidv4(), name: 'Hazmat Delta', type: 'hazmat', status: 'on_standby', capacity: 12, location: 'Industrial Park', contact: 'delta@hazmat.gov', specialization: 'Chemical hazards', createdAt: hoursAgo(24), updatedAt: hoursAgo(0.5) },
    { id: uuidv4(), name: 'Power Utility Team', type: 'utility', status: 'deployed', capacity: 30, location: 'Downtown', contact: 'power@utility.gov', specialization: 'Electrical systems', createdAt: hoursAgo(24), updatedAt: hoursAgo(2.5) },
    { id: uuidv4(), name: 'Evacuation Team', type: 'logistics', status: 'deployed', capacity: 50, location: 'Riverside', contact: 'evac@logistics.gov', specialization: 'Mass evacuation', createdAt: hoursAgo(24), updatedAt: hoursAgo(4) },
    { id: uuidv4(), name: 'Cyber Security Unit', type: 'security', status: 'available', capacity: 8, location: 'Command Center', contact: 'cyber@security.gov', specialization: 'Digital infrastructure', createdAt: hoursAgo(24), updatedAt: hoursAgo(24) },
    { id: uuidv4(), name: 'Air Support Echo', type: 'air_support', status: 'available', capacity: 6, location: 'City Airport', contact: 'echo@airsupport.gov', specialization: 'Aerial reconnaissance', createdAt: hoursAgo(24), updatedAt: hoursAgo(24) }
  ],
  alerts: [],
  aiLogs: []
};

const StoreHelper = {
  getAllCrises: () => store.crises,
  getCrisisById: (id) => store.crises.find((crisis) => crisis.id === id) || null,
  addCrisis: (crisis) => {
    store.crises.unshift(crisis);
    return crisis;
  },
  updateCrisis: (id, updates) => {
    const index = store.crises.findIndex((crisis) => crisis.id === id);
    if (index === -1) return null;
    store.crises[index] = { ...store.crises[index], ...updates, updatedAt: now() };
    return store.crises[index];
  },
  deleteCrisis: (id) => {
    const index = store.crises.findIndex((crisis) => crisis.id === id);
    if (index === -1) return false;
    store.crises.splice(index, 1);
    return true;
  },

  getAllResources: () => store.resources,
  getResourceById: (id) => store.resources.find((resource) => resource.id === id) || null,
  addResource: (resource) => {
    store.resources.unshift(resource);
    return resource;
  },
  updateResource: (id, updates) => {
    const index = store.resources.findIndex((resource) => resource.id === id);
    if (index === -1) return null;
    store.resources[index] = { ...store.resources[index], ...updates, updatedAt: now() };
    return store.resources[index];
  },
  deleteResource: (id) => {
    const index = store.resources.findIndex((resource) => resource.id === id);
    if (index === -1) return false;
    store.resources.splice(index, 1);
    return true;
  },

  addAlert: (alert) => {
    store.alerts.unshift(alert);
    if (store.alerts.length > 200) store.alerts.pop();
    return alert;
  },
  getAlerts: () => store.alerts,
  markAlertRead: (id) => {
    const alert = store.alerts.find((item) => item.id === id);
    if (!alert) return null;
    alert.read = true;
    return alert;
  },

  addAiLog: (log) => {
    store.aiLogs.unshift(log);
    if (store.aiLogs.length > 100) store.aiLogs.pop();
    return log;
  },
  getAiLogs: () => store.aiLogs,

  getStats: () => ({
    totalCrises: store.crises.length,
    activeCrises: store.crises.filter((crisis) => crisis.status === STATUS.ACTIVE).length,
    containedCrises: store.crises.filter((crisis) => crisis.status === STATUS.CONTAINED).length,
    resolvedCrises: store.crises.filter((crisis) => crisis.status === STATUS.RESOLVED).length,
    criticalCrises: store.crises.filter((crisis) => crisis.severity === SEVERITY.CRITICAL).length,
    totalAffected: store.crises.reduce((sum, crisis) => sum + Number(crisis.affectedCount || 0), 0),
    totalResources: store.resources.length,
    deployedResources: store.resources.filter((resource) => resource.status === 'deployed').length,
    availableResources: store.resources.filter((resource) => resource.status === 'available').length,
    aiAnalysesRun: store.aiLogs.length,
    categoryBreakdown: Object.values(CATEGORY).map((category) => ({
      category,
      count: store.crises.filter((crisis) => crisis.category === category).length
    })),
    severityBreakdown: Object.values(SEVERITY).map((severity) => ({
      severity,
      count: store.crises.filter((crisis) => crisis.severity === severity).length
    }))
  })
};

module.exports = {
  store,
  StoreHelper,
  SEVERITY,
  STATUS,
  CATEGORY,
  RESOURCE_TYPES,
  RESOURCE_STATUSES
};
