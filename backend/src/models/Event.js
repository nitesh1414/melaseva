const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: 200,
  },
  code: {
    type: String,
    required: [true, 'Event code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    maxlength: 2000,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  state: {
    type: String,
    trim: true,
  },
  district: {
    type: String,
    trim: true,
  },
  location: {
    address: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  boundary: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
    },
    coordinates: {
      type: [[[Number]]],
    },
  },
  logo: {
    type: String,
  },
  contactInfo: {
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    emergencyNumbers: [{ type: String, trim: true }],
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED'],
    default: 'DRAFT',
  },
  settings: {
    defaultLanguage: { type: String, default: 'en' },
    supportedLanguages: [{ type: String, default: ['en', 'hi'] }],
    enableSMS: { type: Boolean, default: true },
    enablePushNotifications: { type: Boolean, default: true },
    qrCodeFormat: { type: String, default: 'standard' },
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

// Geospatial index for boundary
eventSchema.index({ boundary: '2dsphere' }, { sparse: true });
eventSchema.index({ code: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
