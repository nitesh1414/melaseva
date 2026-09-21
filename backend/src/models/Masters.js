const mongoose = require('mongoose');
const { COMPLAINT_PRIORITY } = require('../../../shared/constants');

// Complaint Category Schema
const complaintCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  nameHi: {
    type: String,
    trim: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  defaultPriority: {
    type: String,
    enum: Object.values(COMPLAINT_PRIORITY),
    default: COMPLAINT_PRIORITY.MEDIUM,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

complaintCategorySchema.index({ event: 1, department: 1 });
complaintCategorySchema.index({ event: 1, isActive: 1 });

// SLA Rule Schema
const slaRuleSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComplaintCategory',
  },
  priority: {
    type: String,
    enum: Object.values(COMPLAINT_PRIORITY),
    required: true,
  },
  slaHours: {
    type: Number,
    required: true,
  },
  warningThreshold: {
    type: Number, // percentage, e.g., 75
    default: 75,
  },
  escalationLevel: {
    type: Number,
    default: 1,
  },
  autoEscalate: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

slaRuleSchema.index({ event: 1, priority: 1 });
slaRuleSchema.index({ event: 1, department: 1, priority: 1 });

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  complainant: {
    name: { type: String, trim: true },
    mobile: { type: String, trim: true },
  },
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
  },
  service: {
    type: String,
    trim: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comments: {
    type: String,
    maxlength: 2000,
  },
  sentiment: {
    type: String,
    enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'],
  },
  metadata: {
    source: { type: String, enum: ['WEB', 'MOBILE', 'SMS'] },
    language: { type: String, default: 'en' },
  },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

feedbackSchema.index({ event: 1, rating: 1 });
feedbackSchema.index({ complaint: 1 });

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
      'ASSIGN', 'REASSIGN', 'ESCALATE', 'CLOSE', 'REOPEN',
      'EXPORT', 'IMPORT', 'VERIFY', 'APPROVE', 'REJECT',
    ],
  },
  module: {
    type: String,
    required: true,
    enum: [
      'USER', 'EVENT', 'DEPARTMENT', 'ASSET', 'COMPLAINT',
      'FACILITY', 'QR_CODE', 'COMPLAINT_CATEGORY', 'SLA_RULE',
      'FEEDBACK', 'NOTIFICATION', 'SMS', 'SYSTEM', 'ZONE',
      'SECTOR', 'ROAD',
    ],
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  recordModel: {
    type: String,
  },
  previousValue: {
    type: mongoose.Schema.Types.Mixed,
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
}, {
  timestamps: true,
});

auditLogSchema.index({ event: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ recordModel: 1, recordId: 1 });

// Notification Schema
const notificationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  type: {
    type: String,
    required: true,
    enum: [
      'COMPLAINT_REGISTERED', 'COMPLAINT_ASSIGNED',
      'COMPLAINT_STATUS_CHANGE', 'COMPLAINT_RESOLVED',
      'COMPLAINT_CLOSED', 'COMPLAINT_REOPENED',
      'SLA_WARNING', 'SLA_BREACH', 'SYSTEM',
    ],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relatedComplaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
  },
  channel: {
    type: String,
    enum: ['IN_APP', 'SMS', 'PUSH', 'EMAIL'],
    default: 'IN_APP',
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ'],
    default: 'PENDING',
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  sentAt: {
    type: Date,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ event: 1, type: 1 });
notificationSchema.index({ relatedComplaint: 1 });

// SMS Template Schema
const smsTemplateSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: [
      'COMPLAINT_REGISTERED', 'COMPLAINT_ASSIGNED',
      'COMPLAINT_RESOLVED', 'COMPLAINT_CLOSED',
      'COMPLAINT_REOPENED', 'SLA_WARNING', 'CUSTOM',
    ],
    required: true,
  },
  language: {
    type: String,
    default: 'en',
  },
  template: {
    type: String,
    required: true,
  },
  variables: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

smsTemplateSchema.index({ event: 1, type: 1, language: 1 });

// System Settings Schema
const systemSettingsSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  key: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
  },
  isGlobal: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

systemSettingsSchema.index({ event: 1, key: 1 }, { unique: true, sparse: true });

const ComplaintCategory = mongoose.model('ComplaintCategory', complaintCategorySchema);
const SLARule = mongoose.model('SLARule', slaRuleSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const SMSTemplate = mongoose.model('SMSTemplate', smsTemplateSchema);
const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

module.exports = {
  ComplaintCategory,
  SLARule,
  Feedback,
  AuditLog,
  Notification,
  SMSTemplate,
  SystemSettings,
};
