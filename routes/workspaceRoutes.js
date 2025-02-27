const express = require('express');
const router = express.Router();
const WorkspaceController = require('../controllers/workspaceController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/add', authMiddleware(['owner', 'super_admin', 'manager']), WorkspaceController.addWorkspace);
router.put('/edit/:id', authMiddleware(['owner', 'super_admin', 'manager']), WorkspaceController.editWorkspace);
router.delete('/delete/:id', authMiddleware(['owner', 'super_admin', 'manager']), WorkspaceController.deleteWorkspace);
router.get('/all', authMiddleware(['owner', 'super_admin', 'manager', 'staff']), WorkspaceController.getAllWorkspacesByCreator);
router.post('/:employeeId/workspace/:workspaceId', authMiddleware(['super_admin', 'manager']), WorkspaceController.addEmployeeToWorkspace);

module.exports = router;
