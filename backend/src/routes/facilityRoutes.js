const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const { uploadAssetPhoto } = require('../middleware/upload');
const {
  createFacility, getFacilities, getFacility, updateFacility,
  getNearbyFacilities, getFacilitiesForMap,
} = require('../controllers/facilityController');

// Public routes
router.get('/nearby', getNearbyFacilities);
router.get('/map/:eventId', getFacilitiesForMap);

// Protected routes
router.post('/', authenticate, authorize('facility:manage'), uploadAssetPhoto, createFacility);
router.get('/', authenticate, getFacilities);
router.get('/:id', authenticate, getFacility);
router.put('/:id', authenticate, authorize('facility:manage'), updateFacility);

module.exports = router;
