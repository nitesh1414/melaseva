const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  qrImage: {
    type: String, // path to generated QR image
  },
  label: {
    assetNumber: { type: String },
    poleNumber: { type: String },
    roadName: { type: String },
    sectorName: { type: String },
    eventName: { type: String },
  },
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
}, {
  timestamps: true,
});

qrCodeSchema.index({ code: 1 });
qrCodeSchema.index({ asset: 1 });
qrCodeSchema.index({ event: 1, status: 1 });

module.exports = mongoose.model('QRCode', qrCodeSchema);
