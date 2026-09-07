const mongoose = require('mongoose');
const { COMPLAINT_STATUS, COMPLAINT_PRIORITY } = require('../../../shared/constants');

const complaintSchema = new mongoose.Schema({
  complaintNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
  },
  complainant: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Complaint category is required'],
    trim: true,
  },
  subCategory: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    maxlength: 5000,
  },
  priority: {
    type: String,
    enum: Object.values(COMPLAINT_PRIORITY),
    default: COMPLAINT_PRIORITY.MEDIUM,
  },
  status: {
    type: String,
    enum: Object.values(COMPLAINT_STATUS),
    default: COMPLAINT_STATUS.NEW,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  address: {
    road: { type: mongoose.Schema.Types.ObjectId, ref: 'Road' },
    sector: { type: mongoose.Schema.Types.ObjectId, ref: 'Sector' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    text: { type: String },
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedAt: {
    type: Date,
  },
  assignedRemarks: {
    type: String,
  },
  sla: {
    deadline: { type: Date },
    breached: { type: Boolean, default: false },
    breachedAt: { type: Date },
    hours: { type: Number },
    warnings: [{
      sentAt: { type: Date, default: Date.now },
      percentReached: Number,
    }],
  },
  attachments: [{
    url: String,
    thumbnail: String,
    type: { type: String, enum: ['complaint', 'resolution', 'evidence'] },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    gps: {
      latitude: Number,
      longitude: Number,
    },
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
    },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
    fromStatus: { type: String },
  }],
  resolution: {
    remarks: { type: String },
    actionTaken: { type: String },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    gps: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    photograph: { type: String },
  },
  closure: {
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    remarks: { type: String },
    rejected: { type: Boolean, default: false },
    rejectionReason: { type: String },
  },
  source: {
    type: String,
    enum: ['QR_SCAN', 'WEB', 'MOBILE', 'PHONE', 'WALK_IN'],
    default: 'WEB',
  },
  isDuplicate: {
    type: Boolean,
    default: false,
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comments: { type: String },
    submittedAt: { type: Date },
  },
  tags: [{ type: String }],
  metadata: {
    userAgent: { type: String },
    ipAddress: { type: String },
    language: { type: String, default: 'en' },
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
complaintSchema.index({ complaintNumber: 1 });
complaintSchema.index({ event: 1, status: 1 });
complaintSchema.index({ event: 1, department: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ 'complainant.mobile': 1 });
complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ event: 1, createdAt: -1 });
complaintSchema.index({ asset: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ 'sla.deadline': 1 });
complaintSchema.index({ isDeleted: 1 });

// Virtual fields
complaintSchema.virtual('isOverdue').get(function() {
  if (!this.sla || !this.sla.deadline) return false;
  if (['RESOLVED', 'CLOSED', 'REJECTED', 'INVALID'].includes(this.status)) return false;
  return new Date() > this.sla.deadline;
});

complaintSchema.virtual('resolutionTime').get(function() {
  if (!this.resolution || !this.resolution.resolvedAt) return null;
  return (this.resolution.resolvedAt - this.createdAt) / (1000 * 60 * 60); // hours
});

module.exports = mongoose.model('Complaint', complaintSchema);
