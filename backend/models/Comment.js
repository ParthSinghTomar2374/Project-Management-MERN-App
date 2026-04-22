const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  issueId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Issue' },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  commentText: { type: String, required: [true, 'Please add text'] }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
