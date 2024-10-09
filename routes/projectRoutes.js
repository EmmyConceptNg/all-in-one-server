const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/add', authMiddleware(['super_admin', 'manager', 'staff']), projectController.addProject);
router.get('/superadmin', authMiddleware(['super_admin']), projectController.getAllProjectsBySuperAdmin);
router.get('/getall/user', authMiddleware(['owner', 'manager', 'staff']), projectController.getAllProjectsByUser);
router.put('/edit/:id', authMiddleware(['super_admin', 'manager', 'staff']), projectController.editProject);
router.delete('/delete/:id', authMiddleware(['super_admin', 'manager', 'staff']), projectController.deleteProject);

module.exports = router;
