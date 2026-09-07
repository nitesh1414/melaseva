const QRCodeModel = require('../models/QRCode');
const Asset = require('../models/Asset');
const { AuditLog } = require('../models/Masters');
const logger = require('../utils/logger');
const QRCodeLib = require('qrcode');
const path = require('path');
const config = require('../config');
const fs = require('fs');

// POST /api/qr-codes/generate
exports.generateQRCode = async (req, res) => {
  try {
    const { assetId, event } = req.body;

    const asset = await Asset.findById(assetId).populate('road sector event');
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    // Check if QR already exists
    const existing = await QRCodeModel.findOne({ asset: assetId, isDeleted: false });
    if (existing) {
      return res.json({
        success: true,
        message: 'QR code already exists for this asset',
        data: existing,
      });
    }

    // Generate unique code
    const code = `QR-${asset.event.code || 'MELA'}-${asset.assetNumber}`;
    const baseUrl = process.env.APP_URL || 'http://localhost:5173';
    const url = `${baseUrl}/asset/${code}`;

    // Generate QR image
    const qrDir = path.join(config.UPLOAD_DIR, 'qr-codes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }
    const imagePath = path.join(qrDir, `${code}.png`);
    
    await QRCodeLib.toFile(imagePath, url, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    const qrCode = new QRCodeModel({
      code,
      asset: assetId,
      event: asset.event._id,
      url,
      qrImage: `/uploads/qr-codes/${code}.png`,
      label: {
        assetNumber: asset.assetNumber,
        poleNumber: asset.poleNumber,
        roadName: asset.road ? asset.road.name : '',
        sectorName: asset.sector ? asset.sector.name : '',
        eventName: asset.event.name,
      },
      createdBy: req.user._id,
    });

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
      action: 'CREATE',
      module: 'QR_CODE',
      recordId: qrCode._id,
      recordModel: 'QRCode',
      description: `QR code ${code} generated for asset ${asset.assetNumber}`,
      event: qrCode.event,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'QR code generated successfully',
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
exports.bulkGenerateQRCodes = async (req, res) => {
  try {
    const { assetIds, event } = req.body;

    const results = { generated: [], skipped: [], errors: [] };

    for (const assetId of assetIds) {
      try {
        const existing = await QRCodeModel.findOne({ asset: assetId, isDeleted: false });
        if (existing) {
          results.skipped.push(assetId);
          continue;
        }

        const asset = await Asset.findById(assetId);
        if (!asset) {
          results.errors.push({ assetId, error: 'Asset not found' });
          continue;
        }

        const code = `QR-${asset.event?.code || 'MELA'}-${asset.assetNumber}`;
        const baseUrl = process.env.APP_URL || 'http://localhost:5173';
        const url = `${baseUrl}/asset/${code}`;

        const qrDir = path.join(config.UPLOAD_DIR, 'qr-codes');
        if (!fs.existsSync(qrDir)) {
          fs.mkdirSync(qrDir, { recursive: true });
        }
        const imagePath = path.join(qrDir, `${code}.png`);
        
        await QRCodeLib.toFile(imagePath, url, {
          width: 300,
          margin: 2,
        });

        const qrCode = new QRCodeModel({
          code,
          asset: assetId,
          event: event || asset.event,
          url,
          qrImage: `/uploads/qr-codes/${code}.png`,
          label: {
            assetNumber: asset.assetNumber,
            poleNumber: asset.poleNumber,
          },
          createdBy: req.user._id,
        });

        await qrCode.save();

        asset.qrCode = { id: qrCode._id, code: qrCode.code, url: qrCode.url };
        await asset.save();

        results.generated.push({ assetId, code: qrCode.code });
      } catch (err) {
        results.errors.push({ assetId, error: err.message });
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

// GET /api/qr-codes
exports.getQRCodes = async (req, res) => {
  try {
    const { event, status, page = 1, limit = 20 } = req.query;
    
    const query = { isDeleted: false };
    if (event) query.event = event;
    if (status) query.status = status;

    const total = await QRCodeModel.countDocuments(query);
    const qrCodes = await QRCodeModel.find(query)
      .populate('asset', 'assetNumber poleNumber assetType')
      .populate('event', 'name code')
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR codes',
    });
  }
};

// GET /api/qr-codes/:code - Public endpoint for QR scan
exports.getAssetByQRCode = async (req, res) => {
  try {
    const { code } = req.params;

    const qrCode = await QRCodeModel.findOne({ code, isDeleted: false, status: 'ACTIVE' })
      .populate({
        path: 'asset',
        populate: [
          { path: 'department', select: 'name' },
          { path: 'road', select: 'name' },
          { path: 'sector', select: 'name code' },
        ],
      })
      .populate('event', 'name code contactInfo');

    if (!qrCode || !qrCode.asset) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found or asset is inactive',
      });
    }

    // Update scan count
    qrCode.scanCount += 1;
    qrCode.lastScannedAt = new Date();
    await qrCode.save();

    const asset = qrCode.asset;

    res.json({
      success: true,
      data: {
        qrCode: {
          code: qrCode.code,
          url: qrCode.url,
        },
        asset: {
          _id: asset._id,
          assetId: asset.assetId,
          assetNumber: asset.assetNumber,
          assetType: asset.assetType,
          poleNumber: asset.poleNumber,
          road: asset.road,
          sector: asset.sector,
          department: asset.department,
          location: asset.location,
          address: asset.address,
          status: asset.status,
        },
        event: qrCode.event,
      },
    });
  } catch (error) {
    logger.error('Get asset by QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset information',
    });
  }
};
