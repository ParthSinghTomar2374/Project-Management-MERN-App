const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Team = require('../models/Team');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Project = require('../models/Project');
const Issue = require('../models/Issue');

const getMyTeam = asyncHandler(async (req, res) => {
  let team = await Team.findOne({ owner: req.user._id })
    .populate('owner', 'name email')
    .populate('members', 'name email role profilePicture')
    .populate('pendingInvitations', 'name email');

  if (!team) {
    team = await Team.create({ owner: req.user._id, members: [], pendingInvitations: [] });
    team = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members', 'name email role profilePicture')
      .populate('pendingInvitations', 'name email');
  }

  res.json(team);
});

const inviteToTeam = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const userToInvite = await User.findOne({ email });
  if (!userToInvite) {
    res.status(404);
    throw new Error('No user found with that email address');
  }

  if (userToInvite._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot invite yourself');
  }

  let team = await Team.findOne({ owner: req.user._id });
  if (!team) {
    team = await Team.create({ owner: req.user._id, members: [], pendingInvitations: [] });
  }

  if (team.members.some(m => m.toString() === userToInvite._id.toString())) {
    res.status(400);
    throw new Error('User is already a member of your team');
  }

  if (!team.pendingInvitations.some(m => m.toString() === userToInvite._id.toString())) {
    team.pendingInvitations.push(userToInvite._id);
    await team.save();
  }

  await Notification.create({
    userId: userToInvite._id,
    message: `${req.user.name} invited you to join their team`,
    type: 'team_invitation',
    teamId: team._id
  });

  res.json({ message: 'Invitation sent successfully' });
});

const acceptTeamInvitation = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId);

  if (!team) {
    res.status(404);
    throw new Error('Team not found');
  }

  if (!team.pendingInvitations.some(m => m.toString() === req.user._id.toString())) {
    res.status(400);
    throw new Error('No pending invitation found');
  }

  team.pendingInvitations = team.pendingInvitations.filter(
    id => id.toString() !== req.user._id.toString()
  );
  team.members.push(req.user._id);
  await team.save();

  await Notification.updateMany(
    { userId: req.user._id, teamId: team._id, type: 'team_invitation' },
    { read: true }
  );

  res.json({ message: 'Invitation accepted' });
});

const declineTeamInvitation = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId);

  if (!team) {
    res.status(404);
    throw new Error('Team not found');
  }

  team.pendingInvitations = team.pendingInvitations.filter(
    id => id.toString() !== req.user._id.toString()
  );
  await team.save();

  await Notification.updateMany(
    { userId: req.user._id, teamId: team._id, type: 'team_invitation' },
    { read: true }
  );

  res.json({ message: 'Invitation declined' });
});

const removeFromTeam = asyncHandler(async (req, res) => {
  const team = await Team.findOne({ owner: req.user._id });

  if (!team) {
    res.status(404);
    throw new Error('Team not found');
  }

  let userIdToRemove;
  try {
    userIdToRemove = new mongoose.Types.ObjectId(req.params.userId);
  } catch {
    res.status(400);
    throw new Error('Invalid user ID');
  }

  team.members = team.members.filter(id => id.toString() !== userIdToRemove.toString());
  await team.save();

  await Project.updateMany(
    { members: { $type: "array" } },
    { $pull: { members: userIdToRemove } }
  );
  await Project.updateMany(
    { pendingMembers: { $type: "array" } },
    { $pull: { pendingMembers: userIdToRemove } }
  );

  await Issue.updateMany(
    { assignedTo: { $type: "array" } },
    { $pull: { assignedTo: userIdToRemove } }
  );

  const updatedTeam = await Team.findById(team._id)
    .populate('owner', 'name email')
    .populate('members', 'name email role profilePicture')
    .populate('pendingInvitations', 'name email');

  res.json(updatedTeam);
});

const getMemberOfTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ members: req.user._id })
    .populate('owner', 'name email')
    .populate('members', 'name email role profilePicture');

  res.json(teams);
});

module.exports = {
  getMyTeam,
  getMemberOfTeams,
  inviteToTeam,
  acceptTeamInvitation,
  declineTeamInvitation,
  removeFromTeam
};
