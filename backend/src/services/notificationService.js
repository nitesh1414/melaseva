const { Notification, SMSTemplate } = require('../models/Masters');
const logger = require('../utils/logger');

// Send notification
const sendNotification = async ({ event, type, title, message, recipient, relatedComplaint, channel = 'IN_APP' }) => {
  try {
    // If no specific recipient, send to all control room operators for the event
    let recipients = [];
    if (recipient) {
      recipients = [recipient];
    } else {
      const User = require('../models/User');
      const controlRoomUsers = await User.find({
        event,
        role: { $in: ['CONTROL_ROOM_OPERATOR', 'MIS_EXECUTIVE', 'EVENT_ADMIN'] },
        status: 'ACTIVE',
        isDeleted: false,
      }).select('_id');
      recipients = controlRoomUsers.map(u => u._id);
    }

    const notifications = recipients.map(recipientId => ({
      event,
      type,
      title,
      message,
      recipient: recipientId,
      relatedComplaint,
      channel,
      status: 'SENT',
      sentAt: new Date(),
    }));

    await Notification.insertMany(notifications);

    // Emit socket event if io is available
    if (global.io) {
      global.io.to(`event_${event}`).emit('notification', {
        type,
        title,
        message,
        relatedComplaint,
      });
    }

    logger.info(`Notification sent: ${type} - ${title}`);
    return notifications;
  } catch (error) {
    logger.error('Send notification error:', error);
    return null;
  }
};

// Send SMS
const sendSMS = async ({ mobile, template, variables, event, language = 'en' }) => {
  try {
    // Find template
    const smsTemplate = await SMSTemplate.findOne({
      event,
      type: template,
      language,
      isActive: true,
    });

    if (!smsTemplate) {
      logger.warn(`SMS template not found: ${template} for language ${language}`);
      return null;
    }

    // Replace variables in template
    let message = smsTemplate.template;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      });
    }

    // Send SMS via configured provider
    if (process.env.SMS_API_URL && process.env.SMS_API_KEY) {
      // Implement actual SMS sending here
      // For now, just log
      logger.info(`SMS would be sent to ${mobile}: ${message}`);
      
      // Example implementation:
      // const response = await fetch(process.env.SMS_API_URL, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${process.env.SMS_API_KEY}`,
      //   },
      //   body: JSON.stringify({ to: mobile, message }),
      // });
    } else {
      logger.info(`SMS (mock) to ${mobile}: ${message}`);
    }

    return { mobile, message, status: 'SENT' };
  } catch (error) {
    logger.error('Send SMS error:', error);
    return null;
  }
};

module.exports = { sendNotification, sendSMS };
