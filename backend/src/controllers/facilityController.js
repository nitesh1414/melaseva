const Facility = require('../models/Facility');
const { AuditLog } = require('../models/Masters');
const logger = require('../utils/logger');

// POST /api/facilities
exports.createFacility = async (req, res) => {
  try {
    const {
      name, type, event, description, latitude, longitude,
      address, contactNumber, operatingHours, capacity,
      status, amenities, managedBy, metadata,
    } = req.body;

    const facility = new Facility({
      name, type, event, description,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      address: address || {},
      contactNumber, operatingHours, capacity,
      status: status || 'ACTIVE',
      amenities, managedBy, metadata,
      createdBy: req.user._id,
    });

    if (req.file) {
      facility.photograph = `/uploads/assets/${req.file.filename}`;
    }

    await facility.save();
    await facility.populate(['event', 'address.sector', 'address.zone', 'managedBy.department']);

    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE',
      module: 'FACILITY',
      recordId: facility._id,
      recordModel: 'Facility',
      description: `Facility ${name} created`,
      event: facility.event,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Facility created successfully',
      data: facility,
    });
  } catch (error) {
    logger.error('Create facility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create facility',
    });
  }
};

// GET /api/facilities
exports.getFacilities = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, event, type, status,
      sector, search, sort = 'name',
    } = req.query;

    const query = { isDeleted: false };

    if (event) query.event = event;
    else if (req.user.event) query.event = req.user.event._id;
    if (type) query.type = type;
    if (status) query.status = status;
    if (sector) query['address.sector'] = sector;

    if (search) {
      query.$text = { $search: search };
    }

    const total = await Facility.countDocuments(query);
    const facilities = await Facility.find(query)
      .populate('event', 'name code')
      .populate('address.sector', 'name code')
      .populate('address.zone', 'name')
      .populate('managedBy.department', 'name')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: facilities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get facilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch facilities',
    });
  }
};

// GET /api/facilities/:id
exports.getFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id)
      .populate('event', 'name code')
      .populate('address.sector', 'name code')
      .populate('address.zone', 'name')
      .populate('managedBy.department', 'name');

    if (!facility || facility.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found',
      });
    }

    res.json({
      success: true,
      data: facility,
    });
  } catch (error) {
    logger.error('Get facility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch facility',
    });
  }
};

// GET /api/facilities/nearby
exports.getNearbyFacilities = async (req, res) => {
  try {
    const { latitude, longitude, radius = 1000, event, type } = req.query;

    const query = {
      isDeleted: false,
      status: 'ACTIVE',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    };

    if (event) query.event = event;
    if (type) query.type = type;

    const facilities = await Facility.find(query)
      .populate('managedBy.department', 'name')
      .limit(50);

    // Calculate distance for each facility
    const result = facilities.map(f => {
      const distance = calculateDistance(
        parseFloat(latitude), parseFloat(longitude),
        f.location.coordinates[1], f.location.coordinates[0]
      );
      return { ...f.toObject(), distance: Math.round(distance) };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get nearby facilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby facilities',
    });
  }
};

// GET /api/facilities/map/:eventId
exports.getFacilitiesForMap = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { type } = req.query;

    const query = {
      event: eventId,
      isDeleted: false,
      status: 'ACTIVE',
    };

    if (type) query.type = type;

    const facilities = await Facility.find(query)
      .select('name type location contactNumber operatingHours')
      .limit(500);

    res.json({
      success: true,
      data: facilities.map(f => ({
        id: f._id,
        name: f.name,
        type: f.type,
        coordinates: f.location.coordinates,
        contactNumber: f.contactNumber,
        operatingHours: f.operatingHours,
      })),
    });
  } catch (error) {
    logger.error('Get facilities for map error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch facilities for map',
    });
  }
};

// Haversine distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// PUT /api/facilities/:id
exports.updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility || facility.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found',
      });
    }

    const fields = ['name', 'type', 'description', 'contactNumber',
      'operatingHours', 'capacity', 'status', 'amenities', 'managedBy', 'metadata'];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        facility[field] = req.body[field];
      }
    });

    if (req.body.latitude && req.body.longitude) {
      facility.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
      };
    }

    facility.updatedBy = req.user._id;
    await facility.save();

    res.json({
      success: true,
      message: 'Facility updated successfully',
      data: facility,
    });
  } catch (error) {
    logger.error('Update facility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update facility',
    });
  }
};
