const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['info', 'invitation', 'team_invitation'], default: 'info' },
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
