const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  // Asset binding - optional (QR generated first, bound later)
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  // GPS location captured at pole - optional (can be added later)
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude] — required only if type is 'Point'
    },
  },
  gpsAccuracy: {
    type: Number,
  },
  // Pole identification
  poleNumber: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  qrImage: {
    type: String,
  },
  label: {
    assetNumber: { type: String },
    poleNumber: { type: String },
    roadName: { type: String },
    sectorName: { type: String },
    zoneName: { type: String },
    eventName: { type: String },
    address: { type: String },
  },
  // Binding status
  bindingStatus: {
    type: String,
    enum: ['UNBOUND', 'BOUND', 'VERIFIED'],
    default: 'UNBOUND',
  },
  boundAt: { type: Date },
  boundBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Physical installation
  installationStatus: {
    type: String,
    enum: ['GENERATED', 'PRINTED', 'INSTALLED', 'DAMAGED', 'REPLACED'],
    default: 'GENERATED',
  },
  installedAt: { type: Date },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'DAMAGED', 'REPLACED'],
    default: 'ACTIVE',
  },
  printHistory: [{
    printedAt: { type: Date, default: Date.now },
    printedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    format: { type: String },
    quantity: { type: Number, default: 1 },
  }],
  scanCount: {
    type: Number,
    default: 0,
  },
  lastScannedAt: {
    type: Date,
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

// Indexes — sparse for location so docs without GPS still work
qrCodeSchema.index({ code: 1 });
qrCodeSchema.index({ asset: 1 });
qrCodeSchema.index({ event: 1, status: 1 });
qrCodeSchema.index({ location: '2dsphere' }, { sparse: true });
qrCodeSchema.index({ poleNumber: 1 });
qrCodeSchema.index({ bindingStatus: 1 });
qrCodeSchema.index({ 'label.poleNumber': 1 });

module.exports = mongoose.model('QRCode', qrCodeSchema);
