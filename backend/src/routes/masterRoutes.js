const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const { AuditLog, ComplaintCategory, SLARule, SMSTemplate, Notification, SystemSettings } = require('../models/Masters');
const Department = require('../models/Department');
const { Zone, Sector, Road } = require('../models/ZoneSectorRoad');
const logger = require('../utils/logger');

// === DEPARTMENT ROUTES ===
router.post('/departments', authenticate, authorize('department:manage'), async (req, res) => {
  try {
    const dept = new Department({ ...req.body, createdBy: req.user._id });
    await dept.save();
    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    logger.error('Create department error:', error);
    res.status(500).json({ success: false, message: 'Failed to create department' });
  }
});

router.get('/departments', authenticate, async (req, res) => {
  try {
    const query = { isDeleted: false };
    if (req.query.event) query.event = req.query.event;
    else if (req.user.event) query.event = req.user.event._id;
    
    const departments = await Department.find(query).sort('name');
    res.json({ success: true, data: departments });
  } catch (error) {
    logger.error('Get departments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch departments' });
  }
});

router.put('/departments/:id', authenticate, authorize('department:manage'), async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update department' });
  }
});

// === COMPLAINT CATEGORY ROUTES ===
router.post('/complaint-categories', authenticate, authorize('category:manage'), async (req, res) => {
  try {
    const category = new ComplaintCategory({ ...req.body, createdBy: req.user._id });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

router.get('/complaint-categories', authenticate, async (req, res) => {
  try {
    const query = { isDeleted: false, isActive: true };
    if (req.query.event) query.event = req.query.event;
    if (req.query.department) query.department = req.query.department;
    
    const categories = await ComplaintCategory.find(query)
      .populate('department', 'name code')
      .sort('sortOrder name');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// === SLA RULE ROUTES ===
router.post('/sla-rules', authenticate, authorize('slarule:manage'), async (req, res) => {
  try {
    const rule = new SLARule({ ...req.body, createdBy: req.user._id });
    await rule.save();
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create SLA rule' });
  }
});

router.get('/sla-rules', authenticate, async (req, res) => {
  try {
    const query = { isDeleted: false, isActive: true };
    if (req.query.event) query.event = req.query.event;
    
    const rules = await SLARule.find(query)
      .populate('department', 'name code')
      .sort('priority');
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch SLA rules' });
  }
});

// === ZONE/SECTOR/ROAD ROUTES ===
router.post('/zones', authenticate, authorize('event:manage'), async (req, res) => {
  try {
    const zone = new Zone({ ...req.body, createdBy: req.user._id });
    await zone.save();
    res.status(201).json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create zone' });
  }
});

router.get('/zones', authenticate, async (req, res) => {
  try {
    const query = { isDeleted: false };
    if (req.query.event) query.event = req.query.event;
    const zones = await Zone.find(query).sort('name');
    res.json({ success: true, data: zones });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch zones' });
  }
});

router.post('/sectors', authenticate, authorize('event:manage'), async (req, res) => {
  try {
    const sector = new Sector({ ...req.body, createdBy: req.user._id });
    await sector.save();
    res.status(201).json({ success: true, data: sector });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create sector' });
  }
});

router.get('/sectors', authenticate, async (req, res) => {
  try {
    const query = { isDeleted: false };
    if (req.query.event) query.event = req.query.event;
    if (req.query.zone) query.zone = req.query.zone;
    const sectors = await Sector.find(query).populate('zone', 'name').sort('name');
    res.json({ success: true, data: sectors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sectors' });
  }
});

router.post('/roads', authenticate, authorize('event:manage'), async (req, res) => {
  try {
    const road = new Road({ ...req.body, createdBy: req.user._id });
    await road.save();
    res.status(201).json({ success: true, data: road });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create road' });
  }
});

router.get('/roads', authenticate, async (req, res) => {
  try {
    const query = { isDeleted: false };
    if (req.query.event) query.event = req.query.event;
    if (req.query.sector) query.sector = req.query.sector;
    const roads = await Road.find(query).populate('sector', 'name').sort('name');
    res.json({ success: true, data: roads });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch roads' });
  }
});

// === AUDIT LOG ROUTES ===
router.get('/audit-logs', authenticate, async (req, res) => {
  try {
    const { event, module, action, user, page = 1, limit = 50 } = req.query;
    const query = {};
    if (event) query.event = event;
    if (module) query.module = module;
    if (action) query.action = action;
    if (user) query.user = user;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name role')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
});

// === NOTIFICATION ROUTES ===
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') query.read = false;

    const notifications = await Notification.find(query)
      .populate('relatedComplaint', 'complaintNumber status')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      read: true,
      readAt: new Date(),
      status: 'READ',
    });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

// === SMS TEMPLATE ROUTES ===
router.post('/sms-templates', authenticate, authorize('event:manage'), async (req, res) => {
  try {
    const template = new SMSTemplate({ ...req.body, createdBy: req.user._id });
    await template.save();
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create SMS template' });
  }
});

router.get('/sms-templates', authenticate, async (req, res) => {
  try {
    const query = { isDeleted: false };
    if (req.query.event) query.event = req.query.event;
    if (req.query.type) query.type = req.query.type;
    const templates = await SMSTemplate.find(query).sort('type language');
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch SMS templates' });
  }
});

// === SYSTEM SETTINGS ROUTES ===
router.get('/settings', authenticate, async (req, res) => {
  try {
    const query = req.query.event ? { event: req.query.event } : { isGlobal: true };
    const settings = await SystemSettings.find(query);
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json({ success: true, data: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

router.put('/settings', authenticate, authorize('event:manage'), async (req, res) => {
  try {
    const { settings, event } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await SystemSettings.findOneAndUpdate(
        { key, event },
        { key, value, event, isGlobal: !event },
        { upsert: true, new: true }
      );
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

module.exports = router;
