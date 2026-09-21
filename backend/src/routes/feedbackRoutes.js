const express = require('express');
const router = express.Router();
const { Feedback } = require('../models/Masters');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

// POST /api/feedback - Public feedback
router.post('/', async (req, res) => {
  try {
    const { event, complaint, service, department, rating, comments, name, mobile } = req.body;

    const sentiment = rating >= 4 ? 'POSITIVE' : rating === 3 ? 'NEUTRAL' : 'NEGATIVE';

    const feedback = new Feedback({
      event,
      complaint,
      service,
      department,
      rating,
      comments,
      sentiment,
      complainant: { name, mobile },
      metadata: {
        source: req.body.source || 'WEB',
        language: req.body.language || 'en',
      },
    });

    await feedback.save();

    // Also update complaint feedback if linked
    if (complaint) {
      const Complaint = require('../models/Complaint');
      await Complaint.findByIdAndUpdate(complaint, {
        feedback: { rating, comments, submittedAt: new Date() },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  } catch (error) {
    logger.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
    });
  }
});

// GET /api/feedback - Admin view feedback
router.get('/', authenticate, async (req, res) => {
  try {
    const { event, page = 1, limit = 20 } = req.query;
    const query = { isDeleted: false };
    if (event) query.event = event;

    const total = await Feedback.countDocuments(query);
    const feedback = await Feedback.find(query)
      .populate('complaint', 'complaintNumber')
      .populate('department', 'name')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Stats
    const stats = await Feedback.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          total: { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'POSITIVE'] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $eq: ['$sentiment', 'NEUTRAL'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'NEGATIVE'] }, 1, 0] } },
        },
      },
    ]);

    res.json({
      success: true,
      data: feedback,
      stats: stats[0] || { avgRating: 0, total: 0, positive: 0, neutral: 0, negative: 0 },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
    });
  }
});

module.exports = router;
