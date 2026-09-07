const mongoose = require('mongoose');

// Zone Schema
const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Zone name is required'],
    trim: true,
  },
  code: {
    type: String,
    trim: true,
    uppercase: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  boundary: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      default: 'Polygon',
    },
    coordinates: {
      type: [[[Number]]],
    },
  },
  center: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
  },
  description: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

zoneSchema.index({ event: 1, code: 1 }, { unique: true });
zoneSchema.index({ boundary: '2dsphere' });

// Sector Schema
const sectorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sector name is required'],
    trim: true,
  },
  code: {
    type: String,
    trim: true,
    uppercase: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
  },
  boundary: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      default: 'Polygon',
    },
    coordinates: {
      type: [[[Number]]],
    },
  },
  center: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
  },
  description: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

sectorSchema.index({ event: 1, code: 1 }, { unique: true });
sectorSchema.index({ boundary: '2dsphere' });
sectorSchema.index({ event: 1, zone: 1 });

// Road Schema
const roadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Road name is required'],
    trim: true,
  },
  code: {
    type: String,
    trim: true,
    uppercase: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  sector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
  },
  path: {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString',
    },
    coordinates: {
      type: [[Number]],
    },
  },
  startLat: { type: Number },
  startLng: { type: Number },
  endLat: { type: Number },
  endLng: { type: Number },
  length: { type: Number }, // in meters
  width: { type: Number }, // in meters
  description: { type: String },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'CLOSED'],
    default: 'ACTIVE',
  },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

roadSchema.index({ event: 1, code: 1 }, { unique: true });
roadSchema.index({ path: '2dsphere' });
roadSchema.index({ event: 1, sector: 1 });

const Zone = mongoose.model('Zone', zoneSchema);
const Sector = mongoose.model('Sector', sectorSchema);
const Road = mongoose.model('Road', roadSchema);

module.exports = { Zone, Sector, Road };
