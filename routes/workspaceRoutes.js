const express = require('express');
const router = express.Router();
const WorkspaceController = require('../controllers/workspaceController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/add', authMiddleware(['super_admin', 'manager']), WorkspaceController.addWorkspace);
router.put('/edit/:id', authMiddleware(['super_admin', 'manager']), WorkspaceController.editWorkspace);
router.delete('/delete/:id', authMiddleware(['super_admin', 'manager']), WorkspaceController.deleteWorkspace);
router.get('/all', authMiddleware(['super_admin', 'manager']), WorkspaceController.getAllWorkspaces);
router.get('/view/:id', authMiddleware(['super_admin', 'manager']), WorkspaceController.getWorkspaceById);

module.exports = router;
