const mongoose = require('mongoose');

const issueSchema = mongoose.Schema({
  title: { type: String, required: [true, 'Please add a title'] },
  description: { type: String },
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Project' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  dueDate: { type: Date },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
