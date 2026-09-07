const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const logger = require('../utils/logger');
const { AuditLog } = require('../models/Masters');

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, event: user.event },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { mobile, email, password } = req.body;

    // Find user by mobile or email
    const query = mobile ? { mobile } : { email };
    const user = await User.findOne(query).select('+password').populate('department event');

    if (!user) {
      // Log failed attempt
      await AuditLog.create({
        action: 'LOGIN',
        module: 'USER',
        description: `Failed login attempt for ${mobile || email}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await AuditLog.create({
        user: user._id,
        action: 'LOGIN',
        module: 'USER',
        description: 'Failed login - wrong password',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const tokens = generateTokens(user);

    // Update refresh token and last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.loginHistory.push({
      loginTime: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      success: true,
    });
    await user.save();

    // Audit log
    await AuditLog.create({
      user: user._id,
      action: 'LOGIN',
      module: 'USER',
      description: 'User logged in',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      event: user.event,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          department: user.department,
          event: user.event,
          profileImage: user.profileImage,
        },
        ...tokens,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

// POST /api/auth/refresh
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken').populate('department event');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const tokens = generateTokens(user);

    // Update refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: 1 } });
    }

    await AuditLog.create({
      user: req.user._id,
      action: 'LOGOUT',
      module: 'USER',
      description: 'User logged out',
      ipAddress: req.ip,
      event: req.user.event,
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.json({
      success: true,
      message: 'Logout successful',
    });
  }
};

// GET /api/auth/me
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('department event');
    
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'UPDATE',
      module: 'USER',
      description: 'Password changed',
      ipAddress: req.ip,
      event: req.user.event,
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
};
