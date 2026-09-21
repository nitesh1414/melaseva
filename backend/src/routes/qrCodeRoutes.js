const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  generateQRCode, bulkGenerateQRCodes, updateQRCode, bindQRToAsset, markInstalled,
  getQRCodes, getQRCode, getQRCodesForMap, getAssetByQRCode, deleteQRCode,
} = require('../controllers/qrCodeController');

// Public route - QR scan (no auth needed)
router.get('/scan/:code', getAssetByQRCode);

// Protected routes
router.post('/generate', authenticate, generateQRCode);
router.post('/bulk-generate', authenticate, bulkGenerateQRCodes);
router.put('/:id', authenticate, updateQRCode);
router.put('/:id/bind', authenticate, bindQRToAsset);
router.put('/:id/install', authenticate, markInstalled);
router.get('/map/:eventId', authenticate, getQRCodesForMap);
router.get('/', authenticate, getQRCodes);
router.get('/:id', authenticate, getQRCode);
router.delete('/:id', authenticate, deleteQRCode);

module.exports = router;
