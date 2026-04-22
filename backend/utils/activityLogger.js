const ActivityLog = require('../models/ActivityLog');

const logActivity = async (issueId, userId, action) => {
  try {
    await ActivityLog.create({
      issueId,
      userId,
      action
    });
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

module.exports = logActivity;
