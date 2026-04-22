const mongoose = require('mongoose');

const activityLogSchema = mongoose.Schema({
  issueId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Issue' },
  action: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
