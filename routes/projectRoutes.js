const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/add', authMiddleware(['super_admin', 'manager', 'staff']), projectController.addProject);
router.get('/', authMiddleware(), projectController.getAllProjects);
router.put('/:id', authMiddleware(['super_admin', 'manager', 'staff']), projectController.editProject);
router.delete('/:id', authMiddleware(['super_admin', 'manager']), projectController.deleteProject);

module.exports = router;
