const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');



const getProjects = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error('User not authorized');
  }

  let query = {};
  
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    query = {
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    };
  }

  const projects = await Project.find(query)
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .populate('pendingMembers', 'name email');

  res.status(200).json(projects);
});


const createProject = asyncHandler(async (req, res) => {
  if (!req.body.projectName) {
    res.status(400);
    throw new Error('Please add a project name');
  }

  const project = await Project.create({
    projectName: req.body.projectName,
    description: req.body.description,
    status: req.body.status || 'Planning',
    priority: req.body.priority || 'Medium',
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    lead: req.body.lead,
    owner: req.user._id,
    members: [req.user._id]
  });

  res.status(201).json(project);
});


const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .populate('pendingMembers', 'name email');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isMember = project.members.some(m => m && m._id && m._id.toString() === req.user.id);
  const isOwner = project.owner && project.owner._id && project.owner._id.toString() === req.user.id;
  const isElevated = req.user.role === 'admin' || req.user.role === 'manager';

  if (!isElevated && !isOwner && !isMember) {
    res.status(401);
    throw new Error('User not authorized to view this project');
  }

  res.status(200).json(project);
});


const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isOwner = project.owner && project.owner.toString() === req.user.id;
  const isElevated = req.user.role === 'admin' || req.user.role === 'manager';

  if (!isElevated && !isOwner) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedProject);
});


const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isOwner = project.owner && project.owner.toString() === req.user.id;
  const isElevated = req.user.role === 'admin' || req.user.role === 'manager';

  if (!isElevated && !isOwner) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await project.deleteOne();
  res.status(200).json({ id: req.params.id });
});


const addMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!project.owner || project.owner.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized (only owner can add members)');
  }

  const userToAdd = await User.findOne({ email: req.body.email });
  if (!userToAdd) {
    res.status(404);
    throw new Error('User with this email not found');
  }



  if (project.members.some(m => m.toString() === userToAdd._id.toString())) {
    res.status(400);
    throw new Error('User is already a member');
  }

  if (project.pendingMembers.some(m => m.toString() === userToAdd._id.toString())) {
    res.status(400);
    throw new Error('User has already been invited');
  }

  project.pendingMembers.push(userToAdd._id);
  await project.save();

  await Notification.create({
    userId: userToAdd._id,
    message: `${req.user.name} invited you to join the project: ${project.projectName}`,
    type: 'invitation',
    projectId: project._id
  });

  const updatedProject = await Project.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .populate('pendingMembers', 'name email');

  res.status(200).json(updatedProject);
});

const acceptInvitation = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!project.pendingMembers.some(m => m.toString() === req.user._id.toString())) {
    res.status(400);
    throw new Error('No pending invitation for this project');
  }

  project.pendingMembers = project.pendingMembers.filter(id => id.toString() !== req.user._id.toString());
  project.members.push(req.user._id);
  await project.save();

  const user = await User.findById(req.user._id);
  if (user && !user.isInTeam) {
    user.isInTeam = true;
    await user.save();
  }

  await Notification.updateMany(
    { userId: req.user._id, projectId: project._id, type: 'invitation' },
    { read: true }
  );

  res.status(200).json({ message: 'Invitation accepted' });
});

const declineInvitation = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!project.pendingMembers.some(m => m.toString() === req.user._id.toString())) {
    res.status(400);
    throw new Error('No pending invitation for this project');
  }

  project.pendingMembers = project.pendingMembers.filter(id => id.toString() !== req.user._id.toString());
  await project.save();

  await Notification.updateMany(
    { userId: req.user._id, projectId: project._id, type: 'invitation' },
    { read: true }
  );

  res.status(200).json({ message: 'Invitation declined' });
});

const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isOwner = project.owner && project.owner.toString() === req.user.id;
  const isElevated = req.user.role === 'admin' || req.user.role === 'manager';

  if (!isOwner && !isElevated) {
    res.status(401);
    throw new Error('User not authorized (only owner can remove members)');
  }

  const userIdToRemove = req.params.userId;

  if (project.owner.toString() === userIdToRemove) {
    res.status(400);
    throw new Error('Cannot remove the project owner from the team');
  }

  project.members = project.members.filter(
    (memberId) => memberId.toString() !== userIdToRemove
  );
  
  await project.save();

  const updatedProject = await Project.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .populate('pendingMembers', 'name email');

  res.status(200).json(updatedProject);
});

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  acceptInvitation,
  declineInvitation
};
