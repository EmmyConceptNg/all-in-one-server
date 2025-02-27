const express = require('express');
const router = express.Router();
const milestoneController = require('../controllers/milestoneController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post(
  '/create',
  authMiddleware(['super_admin', 'manager']),
  milestoneController.createMilestone
);

router.put(
  '/:id',
  authMiddleware(['super_admin', 'manager']),
  milestoneController.updateMilestone
);

router.get(
  '/project/:projectId',
  authMiddleware(['super_admin', 'manager', 'staff']),
  milestoneController.getProjectMilestones
);

router.delete('/:id', authMiddleware(['super_admin', 'manager']), milestoneController.deleteMilestone);

module.exports = router;
