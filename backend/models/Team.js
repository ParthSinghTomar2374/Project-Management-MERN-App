const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingInvitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
