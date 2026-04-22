const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const logActivity = require('../utils/activityLogger');


const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ issueId: req.params.issueId }).populate('userId', 'name email').sort('createdAt');
  res.status(200).json(comments);
});


const addComment = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.issueId);

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  const { commentText } = req.body;

  if (!commentText) {
    res.status(400);
    throw new Error('Please add text');
  }

  const comment = await Comment.create({
    issueId: req.params.issueId,
    userId: req.user._id,
    commentText
  });

  const populatedComment = await Comment.findById(comment._id).populate('userId', 'name email');

  await logActivity(req.params.issueId, req.user._id, 'commented on the issue');

  res.status(201).json(populatedComment);
});


const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  if (comment.userId.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await comment.deleteOne();
  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getComments,
  addComment,
  deleteComment
};
