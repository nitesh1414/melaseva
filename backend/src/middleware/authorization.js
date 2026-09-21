const { ROLE_PERMISSIONS } = require('../../../shared/constants/roles');
const logger = require('../utils/logger');

// Check if user has required permission
const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    
    // Super admin has all permissions
    if (userPermissions.includes('*')) {
      return next();
    }

    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn(`Unauthorized access attempt by user ${req.user._id} (${req.user.role}) for permissions: ${requiredPermissions.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
};

// Check if user belongs to the same event
const checkEventAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  // Super admin can access all events
  const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
  if (userPermissions.includes('*')) {
    return next();
  }

  const eventId = req.params.eventId || req.body.event || req.query.event;
  
  if (eventId && req.user.event && req.user.event._id.toString() !== eventId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this event.',
    });
  }

  next();
};

// Check if user belongs to the same department
const checkDepartmentAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  // Super admin and event admin can access all departments
  const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
  if (userPermissions.includes('*') || req.user.role === 'EVENT_ADMIN') {
    return next();
  }

  const departmentId = req.params.departmentId || req.body.department;
  
  if (departmentId && req.user.department && 
      req.user.department._id.toString() !== departmentId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this department.',
    });
  }

  next();
};

module.exports = { authorize, checkEventAccess, checkDepartmentAccess };
