const express = require('express');
const router = express.Router({ mergeParams: true });
const { getIssues, createIssue, getIssueById, updateIssue, deleteIssue } = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getIssues).post(protect, createIssue);
router.route('/:id').get(protect, getIssueById).put(protect, updateIssue).delete(protect, deleteIssue);

module.exports = router;
