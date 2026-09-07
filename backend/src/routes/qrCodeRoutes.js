const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const {
  generateQRCode, bulkGenerateQRCodes, getQRCodes, getAssetByQRCode,
} = require('../controllers/qrCodeController');

// Public route - QR scan
router.get('/scan/:code', getAssetByQRCode);

// Protected routes
router.post('/generate', authenticate, authorize('qr:assign'), generateQRCode);
router.post('/bulk-generate', authenticate, authorize('qr:assign'), bulkGenerateQRCodes);
router.get('/', authenticate, getQRCodes);

module.exports = router;
