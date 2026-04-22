const asyncHandler = require('express-async-handler');
const ActivityLog = require('../models/ActivityLog');


const getActivities = asyncHandler(async (req, res) => {
  const activities = await ActivityLog.find({ issueId: req.params.issueId })
    .populate('userId', 'name email')
    .sort('-createdAt');
  res.status(200).json(activities);
});

const getRecentActivities = asyncHandler(async (req, res) => {
  const activities = await ActivityLog.find({ userId: req.user.id })
    .populate('issueId', 'title status priority')
    .populate('userId', 'name')
    .sort('-createdAt')
    .limit(10); 

  res.status(200).json(activities);
});

module.exports = { getActivities, getRecentActivities };
