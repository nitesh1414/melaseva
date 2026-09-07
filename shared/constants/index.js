// Complaint Statuses
const COMPLAINT_STATUS = {
  NEW: 'NEW',
  RECEIVED: 'RECEIVED',
  VERIFICATION: 'VERIFICATION',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
  DUPLICATE: 'DUPLICATE',
  INVALID: 'INVALID',
  REOPENED: 'REOPENED',
  ESCALATED: 'ESCALATED',
};

// Complaint Priorities
const COMPLAINT_PRIORITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

// Asset Statuses
const ASSET_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DAMAGED: 'DAMAGED',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  REMOVED: 'REMOVED',
  TEMPORARY: 'TEMPORARY',
  VERIFIED: 'VERIFIED',
  UNVERIFIED: 'UNVERIFIED',
};

// Facility Types (default)
const FACILITY_TYPES = [
  'HOSPITAL', 'POLICE_STATION', 'POLICE_POST', 'TOILET',
  'PARKING', 'GHAT', 'SHELTER', 'FIRE_STATION',
  'DRINKING_WATER', 'HELP_CENTRE', 'CONTROL_ROOM',
  'MEDICAL_CENTRE', 'OTHER'
];

// Default Asset Types
const ASSET_TYPES = [
  'ELECTRICAL_POLE', 'ELECTRICAL_LINE', 'TRANSFORMER', 'SUBSTATION',
  'DISTRIBUTION_BOX', 'STREET_LIGHT', 'GENERATOR', 'CONTROL_PANEL',
  'WATER_POINT', 'TOILET', 'SHELTER', 'PARKING',
  'HOSPITAL', 'POLICE_POST', 'FIRE_STATION', 'OTHER'
];

// Default Departments
const DEFAULT_DEPARTMENTS = [
  { name: 'Electricity', code: 'ELEC' },
  { name: 'Water', code: 'WATER' },
  { name: 'Police', code: 'POLICE' },
  { name: 'Medical', code: 'MEDICAL' },
  { name: 'Sanitation', code: 'SANIT' },
  { name: 'Fire', code: 'FIRE' },
  { name: 'Transport', code: 'TRANS' },
  { name: 'Municipal Services', code: 'MUNICIPAL' },
];

// Default Complaint Categories
const DEFAULT_COMPLAINT_CATEGORIES = {
  ELECTRICITY: [
    'Pole damaged', 'Pole leaning', 'Wire broken', 'Wire hanging',
    'No electricity', 'Spark/fire', 'Transformer issue',
    'Street light not working', 'Exposed wire', 'Electrical safety issue'
  ],
  WATER: ['Water leakage', 'No water supply', 'Water contamination', 'Pipe burst'],
  SANITATION: ['Toilet unclean', 'Garbage not collected', 'Drainage blocked', 'Sewage overflow'],
  POLICE: ['Theft', 'Harassment', 'Crowd control', 'Lost person'],
  MEDICAL: ['Medical emergency', 'First aid needed', 'Ambulance required'],
  FIRE: ['Fire hazard', 'Active fire', 'Smoke report'],
  TRANSPORT: ['Parking issue', 'Traffic problem', 'Shuttle delay'],
};

// SLA Default Hours
const SLA_DEFAULTS = {
  CRITICAL: 0.5, // 30 minutes
  HIGH: 1,       // 1 hour
  MEDIUM: 4,     // 4 hours
  LOW: 24,       // 24 hours
};

// Supported Languages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

// Notification Types
const NOTIFICATION_TYPES = {
  COMPLAINT_REGISTERED: 'COMPLAINT_REGISTERED',
  COMPLAINT_ASSIGNED: 'COMPLAINT_ASSIGNED',
  COMPLAINT_STATUS_CHANGE: 'COMPLAINT_STATUS_CHANGE',
  COMPLAINT_RESOLVED: 'COMPLAINT_RESOLVED',
  COMPLAINT_CLOSED: 'COMPLAINT_CLOSED',
  COMPLAINT_REOPENED: 'COMPLAINT_REOPENED',
  SLA_WARNING: 'SLA_WARNING',
  SLA_BREACH: 'SLA_BREACH',
};

module.exports = {
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
  ASSET_STATUS,
  FACILITY_TYPES,
  ASSET_TYPES,
  DEFAULT_DEPARTMENTS,
  DEFAULT_COMPLAINT_CATEGORIES,
  SLA_DEFAULTS,
  SUPPORTED_LANGUAGES,
  NOTIFICATION_TYPES,
};
