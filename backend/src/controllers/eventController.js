const Event = require('../models/Event');
const Department = require('../models/Department');
const { ComplaintCategory, SLARule, AuditLog } = require('../models/Masters');
const logger = require('../utils/logger');
const { DEFAULT_DEPARTMENTS, DEFAULT_COMPLAINT_CATEGORIES, SLA_DEFAULTS } = require('../../../shared/constants');
const { COMPLAINT_PRIORITY } = require('../../../shared/constants');

// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const {
      name, code, description, startDate, endDate,
      state, district, location, boundary, logo,
      contactInfo, status, settings,
    } = req.body;

    const event = new Event({
      name, code, description, startDate, endDate,
      state, district, location, boundary, logo,
      contactInfo, status: status || 'DRAFT',
      settings: settings || {},
      createdBy: req.user._id,
    });

    await event.save();

    // Create default departments
    const departments = [];
    for (const dept of DEFAULT_DEPARTMENTS) {
      const department = new Department({
        name: dept.name,
        code: dept.code,
        event: event._id,
        defaultSLA: {
          CRITICAL: SLA_DEFAULTS.CRITICAL,
          HIGH: SLA_DEFAULTS.HIGH,
          MEDIUM: SLA_DEFAULTS.MEDIUM,
          LOW: SLA_DEFAULTS.LOW,
        },
        createdBy: req.user._id,
      });
      await department.save();
      departments.push(department);
    }

    // Create default complaint categories
    for (const [deptCode, categories] of Object.entries(DEFAULT_COMPLAINT_CATEGORIES)) {
      const dept = departments.find(d => d.code === deptCode);
      if (!dept) continue;

      for (const catName of categories) {
        const category = new ComplaintCategory({
          name: catName,
          department: dept._id,
          event: event._id,
          defaultPriority: COMPLAINT_PRIORITY.MEDIUM,
          createdBy: req.user._id,
        });
        await category.save();
      }
    }

    // Create default SLA rules
    for (const dept of departments) {
      for (const [priority, hours] of Object.entries(SLA_DEFAULTS)) {
        const slaRule = new SLARule({
          event: event._id,
          department: dept._id,
          priority,
          slaHours: hours,
          warningThreshold: 75,
          autoEscalate: true,
          createdBy: req.user._id,
        });
        await slaRule.save();
      }
    }

    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE',
      module: 'EVENT',
      recordId: event._id,
      recordModel: 'Event',
      description: `Event ${name} created with ${departments.length} departments`,
      event: event._id,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully with default departments, categories, and SLA rules',
      data: event,
    });
  } catch (error) {
    logger.error('Create event error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Event code already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
    });
  }
};

// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = { isDeleted: false };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // Non-super-admin users can only see their own event
    const { ROLE_PERMISSIONS } = require('../../../shared/constants/roles');
    const perms = ROLE_PERMISSIONS[req.user.role] || [];
    if (!perms.includes('*')) {
      if (req.user.event) query._id = req.user.event._id;
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
    });
  }
};

// GET /api/events/:id
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    logger.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
    });
  }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const fields = ['name', 'description', 'startDate', 'endDate', 'state',
      'district', 'location', 'boundary', 'logo', 'contactInfo', 'status', 'settings'];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    event.updatedBy = req.user._id;
    await event.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE',
      module: 'EVENT',
      recordId: event._id,
      recordModel: 'Event',
      description: `Event ${event.name} updated`,
      event: event._id,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    logger.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
    });
  }
};
