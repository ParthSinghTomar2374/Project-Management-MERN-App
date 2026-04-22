const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMyTeam,
  getMemberOfTeams,
  inviteToTeam,
  acceptTeamInvitation,
  declineTeamInvitation,
  removeFromTeam
} = require('../controllers/teamController');

router.get('/', protect, getMyTeam);
router.get('/member-of', protect, getMemberOfTeams);
router.post('/invite', protect, inviteToTeam);
router.post('/accept/:teamId', protect, acceptTeamInvitation);
router.post('/decline/:teamId', protect, declineTeamInvitation);
router.delete('/members/:userId', protect, removeFromTeam);

module.exports = router;
