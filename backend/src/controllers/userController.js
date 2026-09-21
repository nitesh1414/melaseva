const User = require('../models/User');
const { AuditLog } = require('../models/Masters');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

// POST /api/users - Create user
exports.createUser = async (req, res) => {
  try {
    const { name, email, mobile, password, role, department, event, employeeId } = req.body;

    // Check duplicate mobile
    const existingMobile = await User.findOne({ mobile, isDeleted: false });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: 'User with this mobile number already exists',
      });
    }

    // Check duplicate email
    if (email) {
      const existingEmail = await User.findOne({ email, isDeleted: false });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }
    }

    const user = new User({
      name,
      email,
      mobile,
      password: password || 'Mela@123', // default password
      role,
      department,
      event,
      employeeId,
      createdBy: req.user._id,
    });

    await user.save();
    await user.populate(['department', 'event']);

    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE',
      module: 'USER',
      recordId: user._id,
      recordModel: 'User',
      description: `User ${name} created with role ${role}`,
      event,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Create user error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(v => v.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};

// GET /api/users - List users
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, role, department, event,
      status, search, sort = '-createdAt',
    } = req.query;

    const query = { isDeleted: false };

    if (event) query.event = event;
    else if (req.user.event) query.event = req.user.event._id;
    if (role) query.role = role;
    if (department) query.department = department;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('department', 'name code')
      .populate('event', 'name code')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('department', 'name code')
      .populate('event', 'name code');

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updatableFields = ['name', 'email', 'role', 'department', 'event', 'status', 'employeeId'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    user.updatedBy = req.user._id;
    await user.save();
    await user.populate(['department', 'event']);

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE',
      module: 'USER',
      recordId: user._id,
      recordModel: 'User',
      description: `User ${user.name} updated`,
      event: user.event,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

// PUT /api/users/:id/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const newPassword = req.body.password || 'Mela@123';
    user.password = newPassword;
    await user.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE',
      module: 'USER',
      recordId: user._id,
      recordModel: 'User',
      description: `Password reset for user ${user.name}`,
      event: user.event,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};

// DELETE /api/users/:id (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isDeleted = true;
    user.status = 'INACTIVE';
    user.updatedBy = req.user._id;
    await user.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'DELETE',
      module: 'USER',
      recordId: user._id,
      recordModel: 'User',
      description: `User ${user.name} deleted`,
      event: user.event,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};
