const QRCodeModel = require('../models/QRCode');
const Asset = require('../models/Asset');
const Event = require('../models/Event');
const { AuditLog } = require('../models/Masters');
const logger = require('../utils/logger');
const QRCodeLib = require('qrcode');
const path = require('path');
const config = require('../config');
const fs = require('fs');

// POST /api/qr-codes/generate
// Generate a standalone QR code — only pole number required
// GPS, road, sector etc can be added later via update
exports.generateQRCode = async (req, res) => {
  try {
    const { poleNumber, latitude, longitude, gpsAccuracy, road, sector, zone, address, event } = req.body;

    if (!poleNumber) {
      return res.status(400).json({
        success: false,
        message: 'Pole number is required',
      });
    }

    // Auto-detect event from user or request
    let eventId = event || req.user?.event?._id || req.user?.event;
    
    // If still no event, auto-select the first active event
    if (!eventId) {
      const firstEvent = await Event.findOne({ status: 'ACTIVE', isDeleted: { $ne: true } }).sort('-createdAt');
      if (firstEvent) {
        eventId = firstEvent._id;
      }
    }
    
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'No event found. Please create an event first in Event Management.',
      });
    }

    // Get event details
    const eventDoc = await Event.findById(eventId);
    if (!eventDoc) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check for duplicate pole number in same event
    const existingPole = await QRCodeModel.findOne({
      poleNumber,
      event: eventId,
      isDeleted: false,
    });
    if (existingPole) {
      return res.status(400).json({
        success: false,
        message: `QR code already exists for Pole #${poleNumber} in this event`,
        data: existingPole,
      });
    }

    // Generate unique QR code
    const eventCode = eventDoc.code || 'MELA';
    const seqCount = await QRCodeModel.countDocuments({ event: eventId, isDeleted: false });
    const code = `QR-${eventCode}-${String(seqCount + 1).padStart(4, '0')}`;
    const baseUrl = process.env.APP_URL || 'http://localhost:5173';
    const url = `${baseUrl}/asset/${code}`;

    // Generate QR image
    const qrDir = path.join(config.UPLOAD_DIR, 'qr-codes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }
    const imagePath = path.join(qrDir, `${code}.png`);

    // QR data — include GPS if available
    const qrDataObj = { code, pole: poleNumber, event: eventCode, url };
    if (latitude && longitude) {
      qrDataObj.lat = parseFloat(latitude);
      qrDataObj.lng = parseFloat(longitude);
    }

    await QRCodeLib.toFile(imagePath, JSON.stringify(qrDataObj), {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    // Build location if GPS provided
    const locationData = (latitude && longitude) ? {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    } : undefined;

    const qrCode = new QRCodeModel({
      code,
      event: eventId,
      poleNumber,
      location: locationData,
      gpsAccuracy: gpsAccuracy ? parseFloat(gpsAccuracy) : null,
      url,
      qrImage: `/uploads/qr-codes/${code}.png`,
      label: {
        poleNumber,
        roadName: road || '',
        sectorName: sector || '',
        zoneName: zone || '',
        eventName: eventDoc.name,
        address: address || '',
      },
      bindingStatus: 'UNBOUND',
      installationStatus: 'GENERATED',
      createdBy: req.user._id,
    });

    await qrCode.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE',
      module: 'QR_CODE',
      recordId: qrCode._id,
      recordModel: 'QRCode',
      description: `QR code ${code} generated for Pole #${poleNumber}`,
      event: eventId,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `QR code generated for Pole #${poleNumber}`,
      data: qrCode,
    });
  } catch (error) {
    logger.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
    });
  }
};

// POST /api/qr-codes/bulk-generate
// Generate multiple QR codes at once
exports.bulkGenerateQRCodes = async (req, res) => {
  try {
    const { qrEntries, event } = req.body;
    // qrEntries: [{ poleNumber, latitude, longitude, gpsAccuracy, road, sector, zone }]

    if (!qrEntries || qrEntries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one QR entry is required',
      });
    }

    const eventDoc = await Event.findById(event);
    if (!eventDoc) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const eventCode = eventDoc.code || 'MELA';
    const existingCount = await QRCodeModel.countDocuments({ event, isDeleted: false });
    const results = { generated: [], skipped: [], errors: [] };

    const qrDir = path.join(config.UPLOAD_DIR, 'qr-codes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    let seq = existingCount;

    for (const entry of qrEntries) {
      try {
        // Check duplicate
        const existing = await QRCodeModel.findOne({
          poleNumber: entry.poleNumber,
          event,
          isDeleted: false,
        });
        if (existing) {
          results.skipped.push({ poleNumber: entry.poleNumber, reason: 'Already exists' });
          continue;
        }

        seq++;
        const code = `QR-${eventCode}-${String(seq).padStart(4, '0')}`;
        const baseUrl = process.env.APP_URL || 'http://localhost:5173';
        const url = `${baseUrl}/asset/${code}`;

        const qrData = JSON.stringify({
          code,
          pole: entry.poleNumber,
          lat: parseFloat(entry.latitude),
          lng: parseFloat(entry.longitude),
          event: eventCode,
          url,
        });

        const imagePath = path.join(qrDir, `${code}.png`);
        await QRCodeLib.toFile(imagePath, qrData, { width: 300, margin: 2 });

        const qrCode = new QRCodeModel({
          code,
          event,
          poleNumber: entry.poleNumber,
          location: {
            type: 'Point',
            coordinates: [parseFloat(entry.longitude), parseFloat(entry.latitude)],
          },
          gpsAccuracy: entry.gpsAccuracy ? parseFloat(entry.gpsAccuracy) : null,
          url,
          qrImage: `/uploads/qr-codes/${code}.png`,
          label: {
            poleNumber: entry.poleNumber,
            roadName: entry.road || '',
            sectorName: entry.sector || '',
            zoneName: entry.zone || '',
            eventName: eventDoc.name,
            address: entry.address || '',
          },
          bindingStatus: 'UNBOUND',
          installationStatus: 'GENERATED',
          createdBy: req.user._id,
        });

        await qrCode.save();
        results.generated.push({ code, poleNumber: entry.poleNumber, id: qrCode._id });
      } catch (err) {
        results.errors.push({ poleNumber: entry.poleNumber, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Generated ${results.generated.length} QR codes`,
      data: results,
    });
  } catch (error) {
    logger.error('Bulk generate QR codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk generate QR codes',
    });
  }
};

// PUT /api/qr-codes/:id
// Update QR code — add GPS, road, sector, zone etc after generation
exports.updateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { poleNumber, latitude, longitude, gpsAccuracy, road, sector, zone, address } = req.body;

    const qrCode = await QRCodeModel.findById(id);
    if (!qrCode || qrCode.isDeleted) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }

    // Update pole number if provided
    if (poleNumber) qrCode.poleNumber = poleNumber;

    // Update GPS if provided
    if (latitude && longitude) {
      qrCode.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
      if (gpsAccuracy) qrCode.gpsAccuracy = parseFloat(gpsAccuracy);
    }

    // Update label fields
    if (poleNumber) qrCode.label.poleNumber = poleNumber;
    if (road !== undefined) qrCode.label.roadName = road;
    if (sector !== undefined) qrCode.label.sectorName = sector;
    if (zone !== undefined) qrCode.label.zoneName = zone;
    if (address !== undefined) qrCode.label.address = address;

    qrCode.updatedBy = req.user._id;
    await qrCode.save();

    res.json({
      success: true,
      message: 'QR code updated',
      data: qrCode,
    });
  } catch (error) {
    logger.error('Update QR code error:', error);
    res.status(500).json({ success: false, message: 'Failed to update QR code' });
  }
};

// PUT /api/qr-codes/:id/bind
// Bind a generated QR code to an asset
exports.bindQRToAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { assetId } = req.body;

    const qrCode = await QRCodeModel.findById(id);
    if (!qrCode || qrCode.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found',
      });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    // Bind QR to asset
    qrCode.asset = assetId;
    qrCode.bindingStatus = 'BOUND';
    qrCode.boundAt = new Date();
    qrCode.boundBy = req.user._id;
    qrCode.label.assetNumber = asset.assetNumber;
    qrCode.updatedBy = req.user._id;
    await qrCode.save();

    // Update asset with QR info
    asset.qrCode = {
      id: qrCode._id,
      code: qrCode.code,
      url: qrCode.url,
    };
    await asset.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE',
      module: 'QR_CODE',
      recordId: qrCode._id,
      recordModel: 'QRCode',
      description: `QR code ${qrCode.code} bound to asset ${asset.assetId}`,
      event: qrCode.event,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `QR code ${qrCode.code} bound to asset ${asset.assetId}`,
      data: qrCode,
    });
  } catch (error) {
    logger.error('Bind QR to asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bind QR to asset',
    });
  }
};

// PUT /api/qr-codes/:id/install
// Mark QR as installed on pole
exports.markInstalled = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCode = await QRCodeModel.findById(id);
    if (!qrCode || qrCode.isDeleted) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }

    qrCode.installationStatus = 'INSTALLED';
    qrCode.installedAt = new Date();
    qrCode.updatedBy = req.user._id;
    await qrCode.save();

    res.json({ success: true, message: 'QR marked as installed', data: qrCode });
  } catch (error) {
    logger.error('Mark installed error:', error);
    res.status(500).json({ success: false, message: 'Failed' });
  }
};

// GET /api/qr-codes
exports.getQRCodes = async (req, res) => {
  try {
    const { event, status, bindingStatus, page = 1, limit = 50, search } = req.query;

    const query = { isDeleted: false };
    if (event) query.event = event;
    if (status) query.status = status;
    if (bindingStatus) query.bindingStatus = bindingStatus;

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { poleNumber: { $regex: search, $options: 'i' } },
        { 'label.poleNumber': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await QRCodeModel.countDocuments(query);
    const qrCodes = await QRCodeModel.find(query)
      .populate('asset', 'assetId assetNumber assetType poleNumber status')
      .populate('event', 'name code')
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: qrCodes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get QR codes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch QR codes' });
  }
};

// GET /api/qr-codes/map/:eventId
// Get all QR codes on map (by their GPS location)
exports.getQRCodesForMap = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { bindingStatus } = req.query;

    const query = {
      event: eventId,
      isDeleted: false,
      'location.coordinates': { $exists: true },
    };
    if (bindingStatus) query.bindingStatus = bindingStatus;

    const qrCodes = await QRCodeModel.find(query)
      .select('code poleNumber status bindingStatus location label')
      .populate('asset', 'assetId assetType')
      .limit(2000);

    res.json({
      success: true,
      data: qrCodes.map(qr => ({
        id: qr._id,
        code: qr.code,
        poleNumber: qr.poleNumber,
        status: qr.status,
        bindingStatus: qr.bindingStatus,
        coordinates: qr.location.coordinates,
        assetId: qr.asset?.assetId || null,
        assetType: qr.asset?.assetType || null,
        label: qr.label,
      })),
    });
  } catch (error) {
    logger.error('Get QR codes for map error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch QR codes for map' });
  }
};

// GET /api/qr-codes/scan/:code
// Public endpoint - returns asset info AND GPS location from QR
exports.getAssetByQRCode = async (req, res) => {
  try {
    const { code } = req.params;

    const qrCode = await QRCodeModel.findOne({ code, isDeleted: false, status: 'ACTIVE' })
      .populate('event', 'name code contactInfo')
      .populate({
        path: 'asset',
        populate: [
          { path: 'department', select: 'name' },
          { path: 'road', select: 'name' },
          { path: 'sector', select: 'name code' },
        ],
      });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found',
      });
    }

    // Update scan count
    qrCode.scanCount += 1;
    qrCode.lastScannedAt = new Date();
    await qrCode.save();

    // Build response with GPS from QR code (primary source)
    const response = {
      qrCode: {
        code: qrCode.code,
        poleNumber: qrCode.poleNumber,
        url: qrCode.url,
      },
      // GPS location from QR code - always available
      location: {
        type: 'Point',
        coordinates: qrCode.location.coordinates,
        accuracy: qrCode.gpsAccuracy,
      },
      label: qrCode.label,
      event: qrCode.event,
    };

    // If QR is bound to an asset, include asset details
    if (qrCode.asset) {
      const asset = qrCode.asset;
      response.asset = {
        _id: asset._id,
        assetId: asset.assetId,
        assetNumber: asset.assetNumber,
        assetType: asset.assetType,
        poleNumber: asset.poleNumber || qrCode.poleNumber,
        road: asset.road,
        sector: asset.sector,
        department: asset.department,
        location: asset.location,
        address: asset.address,
        status: asset.status,
        description: asset.description,
      };
    }

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error('Get asset by QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset information',
    });
  }
};

// GET /api/qr-codes/:id
exports.getQRCode = async (req, res) => {
  try {
    const qrCode = await QRCodeModel.findById(req.params.id)
      .populate('asset', 'assetId assetNumber assetType poleNumber status location')
      .populate('event', 'name code')
      .populate('createdBy', 'name')
      .populate('boundBy', 'name');

    if (!qrCode || qrCode.isDeleted) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }

    res.json({ success: true, data: qrCode });
  } catch (error) {
    logger.error('Get QR code error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch QR code' });
  }
};

// DELETE /api/qr-codes/:id
exports.deleteQRCode = async (req, res) => {
  try {
    const qrCode = await QRCodeModel.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }

    qrCode.isDeleted = true;
    qrCode.updatedBy = req.user._id;
    await qrCode.save();

    // Unbind from asset if bound
    if (qrCode.asset) {
      await Asset.findByIdAndUpdate(qrCode.asset, {
        $unset: { qrCode: 1 },
      });
    }

    res.json({ success: true, message: 'QR code deleted' });
  } catch (error) {
    logger.error('Delete QR code error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete QR code' });
  }
};
