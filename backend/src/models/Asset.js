const mongoose = require('mongoose');
const { ASSET_STATUS } = require('../../../shared/constants');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  assetType: {
    type: String,
    required: [true, 'Asset type is required'],
    trim: true,
  },
  assetNumber: {
    type: String,
    required: [true, 'Asset number is required'],
    trim: true,
  },
  poleNumber: {
    type: String,
    trim: true,
  },
  qrCode: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'QRCode' },
    code: { type: String },
    url: { type: String },
  },
  road: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Road',
  },
  sector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  gpsAccuracy: {
    type: Number, // in meters
  },
  address: {
    text: { type: String, trim: true },
    landmark: { type: String, trim: true },
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  installationDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: Object.values(ASSET_STATUS),
    default: ASSET_STATUS.UNVERIFIED,
  },
  photographs: [{
    url: String,
    thumbnail: String,
    type: { type: String, enum: ['asset', 'survey', 'installation'] },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gps: {
      latitude: Number,
      longitude: Number,
    },
  }],
  verified: {
    status: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    remarks: { type: String },
  },
  metadata: {
    manufacturer: { type: String },
    model: { type: String },
    capacity: { type: String },
    voltage: { type: String },
    other: { type: mongoose.Schema.Types.Mixed },
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

// Geospatial index - critical for location-based queries
assetSchema.index({ location: '2dsphere' });
assetSchema.index({ assetId: 1 });
assetSchema.index({ assetNumber: 1 });
assetSchema.index({ event: 1, status: 1 });
assetSchema.index({ event: 1, assetType: 1 });
assetSchema.index({ sector: 1 });
assetSchema.index({ road: 1 });
assetSchema.index({ department: 1 });
assetSchema.index({ 'qrCode.code': 1 });
assetSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Asset', assetSchema);
