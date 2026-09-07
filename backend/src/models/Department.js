const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    maxlength: 100,
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  contactPerson: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
  },
  escalationOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  defaultSLA: {
    CRITICAL: { type: Number, default: 0.5 }, // hours
    HIGH: { type: Number, default: 1 },
    MEDIUM: { type: Number, default: 4 },
    LOW: { type: Number, default: 24 },
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
  description: {
    type: String,
    maxlength: 500,
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

departmentSchema.index({ event: 1, code: 1 }, { unique: true });
departmentSchema.index({ event: 1, status: 1 });

module.exports = mongoose.model('Department', departmentSchema);
