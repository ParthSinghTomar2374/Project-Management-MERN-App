const asyncHandler = require('express-async-handler');
const Issue = require('../models/Issue');
const Project = require('../models/Project');
const logActivity = require('../utils/activityLogger');
const User = require('../models/User');



const getIssues = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === 'user') {
    const userProjects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).select('_id');
    const projectIds = userProjects.map(p => p._id);
    filter.projectId = { $in: projectIds };
  }

  if (req.params.projectId || req.query.projectId) {
    const pId = req.params.projectId || req.query.projectId;
    if (filter.projectId && !filter.projectId.$in.map(id => id.toString()).includes(pId)) {
        res.status(401);
        throw new Error('Not authorized to view issues for this project');
    }
    filter.projectId = pId;
  }

  if (req.query.assignedTo === 'me') {
    filter.assignedTo = req.user._id;
  }

  const issues = await Issue.find(filter)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
    
  res.status(200).json(issues);
});


const createIssue = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId || req.body.projectId;
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.owner.toString() !== req.user.id && !project.members.includes(req.user._id)) {
      res.status(401);
      throw new Error('User not authorized to create issues in this project');
  }

  const { title, description, priority, status, assignedTo, dueDate, tags } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  const issue = await Issue.create({
    title,
    description,
    projectId,
    priority,
    status,
    assignedTo,
    createdBy: req.user._id,
    dueDate,
    tags
  });

  // Logic to ensure assignees are project members (already mostly handled by frontend restriction)
  if (assignedTo && Array.isArray(assignedTo)) {
    let projectUpdated = false;
    for (const assigneeId of assignedTo) {
      if (!project.members.map(m => m.toString()).includes(assigneeId.toString())) {
        project.members.push(assigneeId);
        projectUpdated = true;
      }
    }
    if (projectUpdated) await project.save();
  } else if (assignedTo && !Array.isArray(assignedTo)) {
     if (!project.members.map(m => m.toString()).includes(assignedTo.toString())) {
        project.members.push(assignedTo);
        await project.save();
     }
  }


  await logActivity(issue._id, req.user._id, `created the issue`);

  res.status(201).json(issue);
});


const getIssueById = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  if (req.user.role === 'user') {
      const project = await Project.findById(issue.projectId);
      if (project && project.owner.toString() !== req.user.id && !project.members.includes(req.user._id)) {
          res.status(401);
          throw new Error('Not authorized to view this issue');
      }
  }

  res.status(200).json(issue);
});


const updateIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  const project = await Project.findById(issue.projectId);
  const isProjectOwner = project && project.owner.toString() === req.user.id;
  const isCreator = issue.createdBy.toString() === req.user.id;
  const isAssignee = issue.assignedTo && issue.assignedTo.toString() === req.user.id;

  if (req.user.role !== 'admin' && req.user.role !== 'manager' && !isProjectOwner && !isCreator && !isAssignee) {
      res.status(401);
      throw new Error('User not authorized to update this issue');
  }

  const oldStatus = issue.status;
  const oldAssignedTo = issue.assignedTo ? issue.assignedTo.toString() : null;

  const updatedIssue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (req.body.assignedTo) {
    const updatedProject = await Project.findById(issue.projectId);
    if (updatedProject) {
      let projectUpdated = false;
      const assignees = Array.isArray(req.body.assignedTo) ? req.body.assignedTo : [req.body.assignedTo];
      
      for (const assigneeId of assignees) {
        if (!updatedProject.members.map(m => m.toString()).includes(assigneeId.toString())) {
          updatedProject.members.push(assigneeId);
          projectUpdated = true;
        }
      }
      
      if (projectUpdated) await updatedProject.save();

      // Log activity for new assignees (optional, simplified for now)
      if (assignees.length > 0) {
         // We could log for each or just generally
      }
    }
  }


  if (req.body.status && req.body.status !== oldStatus) {
    await logActivity(issue._id, req.user._id, `changed status from "${oldStatus}" to "${req.body.status}"`);
  }

  res.status(200).json(updatedIssue);
});


const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  const project = await Project.findById(issue.projectId);
  const isProjectOwner = project && project.owner.toString() === req.user.id;
  const isCreator = issue.createdBy.toString() === req.user.id;

  if (req.user.role !== 'admin' && req.user.role !== 'manager' && !isProjectOwner && !isCreator) {
      res.status(401);
      throw new Error('User not authorized to delete this issue');
  }

  await issue.deleteOne();
  res.status(200).json({ id: req.params.id });
});


module.exports = {
  getIssues,
  createIssue,
  getIssueById,
  updateIssue,
  deleteIssue
};
