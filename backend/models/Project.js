const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
  projectName: { type: String, required: [true, 'Please add a project name'] },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Planning', 'In Progress', 'Completed'], default: 'Planning' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  startDate: { type: Date },
  endDate: { type: Date },
  lead: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
