const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Facility name is required'],
    trim: true,
    maxlength: 200,
  },
  type: {
    type: String,
    required: [true, 'Facility type is required'],
    trim: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  description: {
    type: String,
    maxlength: 1000,
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
  address: {
    text: { type: String, trim: true },
    sector: { type: mongoose.Schema.Types.ObjectId, ref: 'Sector' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  operatingHours: {
    open: { type: String }, // e.g., "08:00"
    close: { type: String }, // e.g., "20:00"
    twentyFourSeven: { type: Boolean, default: false },
  },
  capacity: {
    type: Number,
  },
  photograph: {
    type: String,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'TEMPORARILY_CLOSED'],
    default: 'ACTIVE',
  },
  amenities: [{
    type: String,
    trim: true,
  }],
  managedBy: {
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    contactPerson: { type: String },
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
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

facilitySchema.index({ location: '2dsphere' });
facilitySchema.index({ event: 1, type: 1 });
facilitySchema.index({ event: 1, status: 1 });
facilitySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Facility', facilitySchema);
