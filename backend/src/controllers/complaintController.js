const Complaint = require('../models/Complaint');
const Asset = require('../models/Asset');
const Event = require('../models/Event');
const { SLARule, AuditLog, Notification } = require('../models/Masters');
const { COMPLAINT_STATUS, COMPLAINT_PRIORITY } = require('../../../shared/constants');
const logger = require('../utils/logger');
const { sendNotification } = require('../services/notificationService');

// Generate complaint number
const generateComplaintNumber = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error('Event not found');
  
  const year = new Date().getFullYear();
  const prefix = `${event.code}-${year}`;
  
  const lastComplaint = await Complaint.findOne({
    complaintNumber: { $regex: `^${prefix}` }
  }).sort({ createdAt: -1 });

  let seq = 1;
  if (lastComplaint) {
    const lastSeq = parseInt(lastComplaint.complaintNumber.split('-').pop());
    seq = lastSeq + 1;
  }

  return `${prefix}-${String(seq).padStart(6, '0')}`;
};

// Get SLA deadline
const getSLADeadline = async (eventId, departmentId, priority) => {
  const slaRule = await SLARule.findOne({
    event: eventId,
    $or: [
      { department: departmentId, priority },
      { department: null, priority },
    ],
    isActive: true,
  }).sort({ department: -1 });

  const hours = slaRule ? slaRule.slaHours : 
    (priority === COMPLAINT_PRIORITY.CRITICAL ? 0.5 :
     priority === COMPLAINT_PRIORITY.HIGH ? 1 :
     priority === COMPLAINT_PRIORITY.MEDIUM ? 4 : 24);

  return {
    deadline: new Date(Date.now() + hours * 60 * 60 * 1000),
    hours,
  };
};

// POST /api/complaints - Create complaint (public or authenticated)
exports.createComplaint = async (req, res) => {
  try {
    const {
      event, asset, department, category, subCategory,
      description, complainant, priority, source,
    } = req.body;

    // Check for duplicate complaints
    if (asset) {
      const recentDuplicate = await Complaint.findOne({
        asset,
        category,
        status: { $nin: [COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.REJECTED] },
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // last 30 min
      });

      if (recentDuplicate) {
        return res.status(200).json({
          success: true,
          message: 'A similar complaint already exists for this asset',
          data: {
            isPossibleDuplicate: true,
            existingComplaint: recentDuplicate.complaintNumber,
            complaint: recentDuplicate,
          },
        });
      }
    }

    const complaintNumber = await generateComplaintNumber(event);
    
    // Get asset details for location
    let locationData = null;
    let assetDoc = null;
    if (asset) {
      assetDoc = await Asset.findById(asset);
      if (assetDoc) {
        locationData = assetDoc.location;
      }
    }

    // Get user's GPS if provided
    const userLocation = req.body.userLocation || null;
    const location = locationData || (userLocation ? {
      type: 'Point',
      coordinates: [userLocation.longitude, userLocation.latitude],
    } : null);

    // Get SLA
    const sla = await getSLADeadline(event, department, priority || COMPLAINT_PRIORITY.MEDIUM);

    const complaint = new Complaint({
      complaintNumber,
      event,
      asset,
      complainant,
      department,
      category,
      subCategory,
      description,
      priority: priority || COMPLAINT_PRIORITY.MEDIUM,
      status: COMPLAINT_STATUS.NEW,
      location,
      source: source || (req.user ? 'MOBILE' : 'WEB'),
      sla,
      statusHistory: [{
        status: COMPLAINT_STATUS.NEW,
        changedBy: req.user ? req.user._id : null,
        remarks: 'Complaint registered',
      }],
      createdBy: req.user ? req.user._id : null,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        language: req.body.language || 'en',
      },
    });

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      complaint.attachments = req.files.map(file => ({
        url: `/uploads/complaints/${file.filename}`,
        type: 'complaint',
        uploadedAt: new Date(),
      }));
    }

    await complaint.save();
    await complaint.populate(['event', 'department', 'asset', 'address.sector', 'address.road']);

    // Audit log
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      action: 'CREATE',
      module: 'COMPLAINT',
      recordId: complaint._id,
      recordModel: 'Complaint',
      description: `Complaint ${complaintNumber} created`,
      event: complaint.event,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Send notification to control room operators
    await sendNotification({
      event: complaint.event,
      type: 'COMPLAINT_REGISTERED',
      title: 'New Complaint Received',
      message: `Complaint ${complaintNumber} - ${category}`,
      relatedComplaint: complaint._id,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully',
      data: complaint,
    });
  } catch (error) {
    logger.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register complaint',
    });
  }
};

// GET /api/complaints - List complaints (with filters)
exports.getComplaints = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, status, department, priority,
      assignedTo, sector, road, event, search,
      startDate, endDate, sort = '-createdAt',
    } = req.query;

    const query = { isDeleted: false };

    // Event filter
    if (event) query.event = event;
    else if (req.user && req.user.event) query.event = req.user.event._id;

    // Role-based filtering
    if (req.user) {
      const perms = require('../../../shared/constants/roles').ROLE_PERMISSIONS[req.user.role] || [];
      if (perms.includes('complaint:view_assigned')) {
        query.assignedTo = req.user._id;
      } else if (perms.includes('complaint:view_department')) {
        query.department = req.user.department ? req.user.department._id : undefined;
      }
    }

    if (status) query.status = status;
    if (department) query.department = department;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (sector) query['address.sector'] = sector;
    if (road) query['address.road'] = road;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { complaintNumber: { $regex: search, $options: 'i' } },
        { 'complainant.name': { $regex: search, $options: 'i' } },
        { 'complainant.mobile': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('event', 'name code')
      .populate('department', 'name code')
      .populate('assignedTo', 'name mobile')
      .populate('asset', 'assetId assetNumber poleNumber')
      .populate('address.sector', 'name code')
      .populate('address.road', 'name')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
    });
  }
};

// GET /api/complaints/:id
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('event', 'name code')
      .populate('department', 'name code')
      .populate('assignedTo', 'name mobile email')
      .populate('assignedBy', 'name')
      .populate('asset')
      .populate('facility')
      .populate('address.sector', 'name code')
      .populate('address.road', 'name')
      .populate('address.zone', 'name')
      .populate('statusHistory.changedBy', 'name role')
      .populate('resolution.resolvedBy', 'name')
      .populate('closure.approvedBy', 'name');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    res.json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    logger.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
    });
  }
};

// PUT /api/complaints/:id/assign
exports.assignComplaint = async (req, res) => {
  try {
    const { assignedTo, priority, assignedRemarks } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const previousStatus = complaint.status;
    const previousAssigned = complaint.assignedTo;

    complaint.assignedTo = assignedTo;
    complaint.assignedBy = req.user._id;
    complaint.assignedAt = new Date();
    complaint.assignedRemarks = assignedRemarks;
    complaint.status = COMPLAINT_STATUS.ASSIGNED;
    if (priority) complaint.priority = priority;

    complaint.statusHistory.push({
      status: COMPLAINT_STATUS.ASSIGNED,
      changedBy: req.user._id,
      remarks: assignedRemarks || `Assigned to officer`,
      fromStatus: previousStatus,
    });

    await complaint.save();
    await complaint.populate(['assignedTo', 'department', 'event']);

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'ASSIGN',
      module: 'COMPLAINT',
      recordId: complaint._id,
      recordModel: 'Complaint',
      previousValue: { assignedTo: previousAssigned, status: previousStatus },
      newValue: { assignedTo, status: COMPLAINT_STATUS.ASSIGNED },
      description: `Complaint ${complaint.complaintNumber} assigned`,
      event: complaint.event,
      ipAddress: req.ip,
    });

    // Send notification to assigned officer
    await sendNotification({
      event: complaint.event,
      type: 'COMPLAINT_ASSIGNED',
      title: 'New Complaint Assigned',
      message: `Complaint ${complaint.complaintNumber} has been assigned to you`,
      recipient: assignedTo,
      relatedComplaint: complaint._id,
    });

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint,
    });
  } catch (error) {
    logger.error('Assign complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign complaint',
    });
  }
};

// PUT /api/complaints/:id/status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const previousStatus = complaint.status;
    
    // Validate status transition
    const validTransitions = {
      [COMPLAINT_STATUS.NEW]: [COMPLAINT_STATUS.RECEIVED, COMPLAINT_STATUS.REJECTED, COMPLAINT_STATUS.DUPLICATE],
      [COMPLAINT_STATUS.RECEIVED]: [COMPLAINT_STATUS.VERIFICATION, COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.REJECTED],
      [COMPLAINT_STATUS.VERIFICATION]: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.INVALID],
      [COMPLAINT_STATUS.ASSIGNED]: [COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.ESCALATED],
      [COMPLAINT_STATUS.IN_PROGRESS]: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.ESCALATED],
      [COMPLAINT_STATUS.RESOLVED]: [COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.REOPENED],
      [COMPLAINT_STATUS.CLOSED]: [COMPLAINT_STATUS.REOPENED],
      [COMPLAINT_STATUS.ESCALATED]: [COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.ASSIGNED],
      [COMPLAINT_STATUS.REOPENED]: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.IN_PROGRESS],
      [COMPLAINT_STATUS.REJECTED]: [COMPLAINT_STATUS.REOPENED],
    };

    // Allow super admin to override
    const { ROLE_PERMISSIONS } = require('../../../shared/constants/roles');
    const isSuperAdmin = (ROLE_PERMISSIONS[req.user.role] || []).includes('*');
    
    if (!isSuperAdmin && validTransitions[previousStatus] && 
        !validTransitions[previousStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${previousStatus} to ${status}`,
      });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      changedBy: req.user._id,
      remarks: remarks || `Status changed to ${status}`,
      fromStatus: previousStatus,
    });

    // Handle resolution
    if (status === COMPLAINT_STATUS.RESOLVED) {
      complaint.resolution = {
        remarks: req.body.resolutionRemarks,
        actionTaken: req.body.actionTaken,
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
        gps: req.body.resolutionGps ? {
          type: 'Point',
          coordinates: [req.body.resolutionGps.longitude, req.body.resolutionGps.latitude],
        } : null,
      };
    }

    // Handle closure
    if (status === COMPLAINT_STATUS.CLOSED) {
      complaint.closure = {
        approvedBy: req.user._id,
        approvedAt: new Date(),
        remarks: remarks,
      };
    }

    // Handle reopening
    if (status === COMPLAINT_STATUS.REOPENED) {
      complaint.closure = {
        ...complaint.closure,
        rejected: true,
        rejectionReason: remarks,
      };
    }

    await complaint.save();

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE',
      module: 'COMPLAINT',
      recordId: complaint._id,
      recordModel: 'Complaint',
      previousValue: { status: previousStatus },
      newValue: { status },
      description: `Complaint ${complaint.complaintNumber} status changed to ${status}`,
      event: complaint.event,
      ipAddress: req.ip,
    });

    // Send notification
    const notificationType = status === COMPLAINT_STATUS.RESOLVED ? 'COMPLAINT_RESOLVED' :
      status === COMPLAINT_STATUS.CLOSED ? 'COMPLAINT_CLOSED' :
      status === COMPLAINT_STATUS.REOPENED ? 'COMPLAINT_REOPENED' : 'COMPLAINT_STATUS_CHANGE';

    await sendNotification({
      event: complaint.event,
      type: notificationType,
      title: `Complaint ${status}`,
      message: `Complaint ${complaint.complaintNumber} is now ${status}`,
      relatedComplaint: complaint._id,
    });

    res.json({
      success: true,
      message: `Complaint status updated to ${status}`,
      data: complaint,
    });
  } catch (error) {
    logger.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
    });
  }
};

// PUT /api/complaints/:id/resolve
exports.resolveComplaint = async (req, res) => {
  try {
    const { remarks, actionTaken, gps } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const previousStatus = complaint.status;
    complaint.status = COMPLAINT_STATUS.RESOLVED;
    complaint.resolution = {
      remarks,
      actionTaken,
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
      gps: gps ? {
        type: 'Point',
        coordinates: [gps.longitude, gps.latitude],
      } : null,
    };

    // Handle resolution photo
    if (req.file) {
      complaint.resolution.photograph = `/uploads/complaints/${req.file.filename}`;
      complaint.attachments.push({
        url: `/uploads/complaints/${req.file.filename}`,
        type: 'resolution',
        uploadedBy: req.user._id,
        gps: gps ? { latitude: gps.latitude, longitude: gps.longitude } : null,
      });
    }

    complaint.statusHistory.push({
      status: COMPLAINT_STATUS.RESOLVED,
      changedBy: req.user._id,
      remarks: remarks || 'Complaint resolved',
      fromStatus: previousStatus,
    });

    await complaint.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE',
      module: 'COMPLAINT',
      recordId: complaint._id,
      recordModel: 'Complaint',
      previousValue: { status: previousStatus },
      newValue: { status: COMPLAINT_STATUS.RESOLVED },
      description: `Complaint ${complaint.complaintNumber} resolved`,
      event: complaint.event,
      ipAddress: req.ip,
    });

    await sendNotification({
      event: complaint.event,
      type: 'COMPLAINT_RESOLVED',
      title: 'Complaint Resolved',
      message: `Complaint ${complaint.complaintNumber} has been resolved`,
      relatedComplaint: complaint._id,
    });

    res.json({
      success: true,
      message: 'Complaint resolved successfully',
      data: complaint,
    });
  } catch (error) {
    logger.error('Resolve complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve complaint',
    });
  }
};

// GET /api/complaints/dashboard/:eventId
exports.getDashboardStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { startDate, endDate, department } = req.query;

    const baseQuery = { event: eventId, isDeleted: false };
    
    if (startDate || endDate) {
      baseQuery.createdAt = {};
      if (startDate) baseQuery.createdAt.$gte = new Date(startDate);
      if (endDate) baseQuery.createdAt.$lte = new Date(endDate);
    }
    if (department) baseQuery.department = department;

    const [
      total,
      newCount,
      assignedCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      escalatedCount,
      overdueCount,
      unassignedCount,
    ] = await Promise.all([
      Complaint.countDocuments(baseQuery),
      Complaint.countDocuments({ ...baseQuery, status: COMPLAINT_STATUS.NEW }),
      Complaint.countDocuments({ ...baseQuery, status: COMPLAINT_STATUS.ASSIGNED }),
      Complaint.countDocuments({ ...baseQuery, status: COMPLAINT_STATUS.IN_PROGRESS }),
      Complaint.countDocuments({ ...baseQuery, status: COMPLAINT_STATUS.RESOLVED }),
      Complaint.countDocuments({ ...baseQuery, status: COMPLAINT_STATUS.CLOSED }),
      Complaint.countDocuments({ ...baseQuery, status: COMPLAINT_STATUS.ESCALATED }),
      Complaint.countDocuments({
        ...baseQuery,
        status: { $nin: [COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.REJECTED] },
        'sla.deadline': { $lt: new Date() },
      }),
      Complaint.countDocuments({
        ...baseQuery,
        assignedTo: null,
        status: { $nin: [COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.REJECTED] },
      }),
    ]);

    // Department-wise stats
    const departmentStats = await Complaint.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $in: ['$status', [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED]] }, 1, 0] },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$sla.deadline', new Date()] },
                    { $nin: ['$status', [COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.REJECTED]] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    ]);

    // Hourly trend (last 24 hours)
    const hourlyTrend = await Complaint.aggregate([
      {
        $match: {
          ...baseQuery,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Average resolution time
    const avgResolution = await Complaint.aggregate([
      {
        $match: {
          ...baseQuery,
          status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
          'resolution.resolvedAt': { $exists: true },
        },
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolution.resolvedAt', '$createdAt'] },
              1000 * 60 * 60, // convert to hours
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgHours: { $avg: '$resolutionTime' },
          minHours: { $min: '$resolutionTime' },
          maxHours: { $max: '$resolutionTime' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          total,
          new: newCount,
          assigned: assignedCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
          closed: closedCount,
          escalated: escalatedCount,
          overdue: overdueCount,
          unassigned: unassignedCount,
        },
        departmentStats,
        hourlyTrend,
        resolutionTime: avgResolution[0] || { avgHours: 0, minHours: 0, maxHours: 0 },
        resolutionPercentage: total > 0 ? ((resolvedCount + closedCount) / total * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
    });
  }
};

// GET /api/complaints/track
exports.trackComplaint = async (req, res) => {
  try {
    const { complaintNumber, mobile } = req.query;

    if (!complaintNumber) {
      return res.status(400).json({
        success: false,
        message: 'Complaint number is required',
      });
    }

    const query = { complaintNumber: complaintNumber.toUpperCase() };
    if (mobile) query['complainant.mobile'] = mobile;

    const complaint = await Complaint.findOne(query)
      .select('-metadata')
      .populate('department', 'name')
      .populate('statusHistory.changedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    res.json({
      success: true,
      data: {
        complaintNumber: complaint.complaintNumber,
        status: complaint.status,
        category: complaint.category,
        department: complaint.department,
        createdAt: complaint.createdAt,
        statusHistory: complaint.statusHistory,
        resolution: complaint.status === COMPLAINT_STATUS.RESOLVED || complaint.status === COMPLAINT_STATUS.CLOSED
          ? { remarks: complaint.resolution?.remarks, resolvedAt: complaint.resolution?.resolvedAt }
          : null,
      },
    });
  } catch (error) {
    logger.error('Track complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track complaint',
    });
  }
};

// GET /api/complaints/map/:eventId
exports.getComplaintsForMap = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, department } = req.query;

    const query = {
      event: eventId,
      isDeleted: false,
      'location.coordinates': { $exists: true },
    };

    if (status) query.status = status;
    if (department) query.department = department;

    const complaints = await Complaint.find(query)
      .select('complaintNumber category status priority location createdAt assignedTo')
      .populate('assignedTo', 'name')
      .limit(500);

    res.json({
      success: true,
      data: complaints.map(c => ({
        id: c._id,
        complaintNumber: c.complaintNumber,
        category: c.category,
        status: c.status,
        priority: c.priority,
        coordinates: c.location.coordinates,
        createdAt: c.createdAt,
        assignedTo: c.assignedTo?.name || 'Unassigned',
      })),
    });
  } catch (error) {
    logger.error('Get complaints for map error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints for map',
    });
  }
};
