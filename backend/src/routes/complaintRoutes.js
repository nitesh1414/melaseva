const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const { uploadComplaintPhoto, uploadResolutionPhoto } = require('../middleware/upload');
const {
  createComplaint, getComplaints, getComplaint, assignComplaint,
  updateComplaintStatus, resolveComplaint, getDashboardStats,
  trackComplaint, getComplaintsForMap,
} = require('../controllers/complaintController');

// Public routes
router.post('/', uploadComplaintPhoto, createComplaint);
router.get('/track', trackComplaint);

// Protected routes
router.get('/map/:eventId', authenticate, getComplaintsForMap);
router.get('/dashboard/:eventId', authenticate, getDashboardStats);
router.get('/', authenticate, getComplaints);
router.get('/:id', authenticate, getComplaint);
router.put('/:id/assign', authenticate, authorize('complaint:assign'), assignComplaint);
router.put('/:id/status', authenticate, authorize('complaint:update'), updateComplaintStatus);
router.put('/:id/resolve', authenticate, authorize('complaint:resolve'), uploadResolutionPhoto, resolveComplaint);

module.exports = router;
