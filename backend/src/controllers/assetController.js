const Asset = require('../models/Asset');
const QRCode = require('../models/QRCode');
const { AuditLog } = require('../models/Masters');
const logger = require('../utils/logger');
const QRCodeLib = require('qrcode');
const path = require('path');
const fs = require('fs');

// POST /api/assets - Create asset
exports.createAsset = async (req, res) => {
  try {
    const {
      assetType, assetNumber, poleNumber, road, sector, zone,
      department, event, latitude, longitude, gpsAccuracy,
      address, description, installationDate, status, metadata,
    } = req.body;

    // Check duplicate asset number
    const existing = await Asset.findOne({ assetNumber, event, isDeleted: false });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Asset number already exists for this event',
      });
    }

    // Generate unique asset ID
    const eventObj = await require('../models/Event').findById(event);
    const assetId = `${eventObj.code}-${assetType.substring(0, 3).toUpperCase()}-${String(Date.now()).slice(-6)}`;

    const asset = new Asset({
      assetId,
      assetType,
      assetNumber,
      poleNumber,
      road,
      sector,
      zone,
      department,
      event,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      gpsAccuracy: gpsAccuracy ? parseFloat(gpsAccuracy) : null,
      address: address || {},
      description,
      installationDate,
      status: status || 'UNVERIFIED',
      metadata: metadata || {},
      createdBy: req.user._id,
    });

    // Handle photo upload
    if (req.file) {
      asset.photographs.push({
        url: `/uploads/assets/${req.file.filename}`,
        type: 'asset',
        uploadedAt: new Date(),
        uploadedBy: req.user._id,
        gps: latitude && longitude ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) } : null,
      });
    }

    await asset.save();
    await asset.populate(['event', 'department', 'road', 'sector', 'zone']);

    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE',
      module: 'ASSET',
      recordId: asset._id,
      recordModel: 'Asset',
      description: `Asset ${assetId} created`,
      event: asset.event,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: asset,
    });
  } catch (error) {
    logger.error('Create asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create asset',
    });
  }
};

// GET /api/assets - List assets
exports.getAssets = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, event, assetType, status,
      department, sector, road, search, sort = '-createdAt',
    } = req.query;

    const query = { isDeleted: false };

    if (event) query.event = event;
    else if (req.user.event) query.event = req.user.event._id;
    if (assetType) query.assetType = assetType;
    if (status) query.status = status;
    if (department) query.department = department;
    if (sector) query.sector = sector;
    if (road) query.road = road;

    if (search) {
      query.$or = [
        { assetId: { $regex: search, $options: 'i' } },
        { assetNumber: { $regex: search, $options: 'i' } },
        { poleNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Asset.countDocuments(query);
    const assets = await Asset.find(query)
      .populate('event', 'name code')
      .populate('department', 'name code')
      .populate('road', 'name')
      .populate('sector', 'name code')
      .populate('zone', 'name')
      .populate('qrCode.id', 'code')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: assets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets',
    });
  }
};

// GET /api/assets/:id
exports.getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('event', 'name code')
      .populate('department', 'name code')
      .populate('road', 'name')
      .populate('sector', 'name code')
      .populate('zone', 'name')
      .populate('qrCode.id')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    res.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    logger.error('Get asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset',
    });
  }
};

// PUT /api/assets/:id
exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    const previousValue = { ...asset.toObject() };
    
    // Update fields
    const fields = ['assetType', 'assetNumber', 'poleNumber', 'road', 'sector', 
      'zone', 'department', 'description', 'status', 'metadata'];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        asset[field] = req.body[field];
      }
    });

    // Update location
    if (req.body.latitude && req.body.longitude) {
      asset.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
      };
      if (req.body.gpsAccuracy) asset.gpsAccuracy = parseFloat(req.body.gpsAccuracy);
    }

    // Handle photo upload
    if (req.file) {
      asset.photographs.push({
        url: `/uploads/assets/${req.file.filename}`,
        type: 'survey',
        uploadedAt: new Date(),
        uploadedBy: req.user._id,
      });
    }

    asset.updatedBy = req.user._id;
    await asset.save();
    await asset.populate(['event', 'department', 'road', 'sector', 'zone']);

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE',
      module: 'ASSET',
      recordId: asset._id,
      recordModel: 'Asset',
      previousValue: { status: previousValue.status, description: previousValue.description },
      newValue: { status: asset.status, description: asset.description },
      description: `Asset ${asset.assetId} updated`,
      event: asset.event,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: asset,
    });
  } catch (error) {
    logger.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update asset',
    });
  }
};

// GET /api/assets/map/:eventId
exports.getAssetsForMap = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { assetType, status } = req.query;

    const query = {
      event: eventId,
      isDeleted: false,
      'location.coordinates': { $exists: true },
    };

    if (assetType) query.assetType = assetType;
    if (status) query.status = status;

    const assets = await Asset.find(query)
      .select('assetId assetNumber assetType poleNumber status location')
      .limit(2000);

    res.json({
      success: true,
      data: assets.map(a => ({
        id: a._id,
        assetId: a.assetId,
        assetNumber: a.assetNumber,
        assetType: a.assetType,
        poleNumber: a.poleNumber,
        status: a.status,
        coordinates: a.location.coordinates,
      })),
    });
  } catch (error) {
    logger.error('Get assets for map error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets for map',
    });
  }
};

// GET /api/assets/nearby
exports.getNearbyAssets = async (req, res) => {
  try {
    const { latitude, longitude, radius = 500, event, assetType } = req.query;

    const query = {
      isDeleted: false,
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
    if (assetType) query.assetType = assetType;

    const assets = await Asset.find(query)
      .populate('department', 'name')
      .populate('road', 'name')
      .populate('sector', 'name')
      .limit(50);

    res.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    logger.error('Get nearby assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby assets',
    });
  }
};

// DELETE /api/assets/:id
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    asset.isDeleted = true;
    asset.updatedBy = req.user._id;
    await asset.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'DELETE',
      module: 'ASSET',
      recordId: asset._id,
      recordModel: 'Asset',
      description: `Asset ${asset.assetId} deleted`,
      event: asset.event,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    logger.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete asset',
    });
  }
};
