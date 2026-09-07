const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const { uploadAssetPhoto } = require('../middleware/upload');
const {
  createAsset, getAssets, getAsset, updateAsset,
  deleteAsset, getAssetsForMap, getNearbyAssets,
} = require('../controllers/assetController');

// Public routes
router.get('/nearby', getNearbyAssets);

// Protected routes
router.get('/map/:eventId', authenticate, getAssetsForMap);
router.post('/', authenticate, authorize('asset:create'), uploadAssetPhoto, createAsset);
router.get('/', authenticate, getAssets);
router.get('/:id', authenticate, getAsset);
router.put('/:id', authenticate, authorize('asset:update'), uploadAssetPhoto, updateAsset);
router.delete('/:id', authenticate, authorize('asset:update'), deleteAsset);

module.exports = router;
