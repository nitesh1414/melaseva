const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const {
  createEvent, getEvents, getEvent, updateEvent,
} = require('../controllers/eventController');

router.post('/', authenticate, authorize('event:manage'), createEvent);
router.get('/', authenticate, getEvents);
router.get('/:id', authenticate, getEvent);
router.put('/:id', authenticate, authorize('event:manage'), updateEvent);

module.exports = router;
