const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employeeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/add', authMiddleware(['super_admin', 'manager']), EmployeeController.addEmployee);
router.put('/edit/:id', authMiddleware(['super_admin', 'manager']), EmployeeController.editEmployee);
router.delete('/delete/:id', authMiddleware(['super_admin', 'manager']), EmployeeController.deleteEmployee);
router.get('/all', authMiddleware(['owner', 'super_admin', 'manager', 'staff']), EmployeeController.getAllEmployeesBySuperAdmin);
// router.get('/staff', authMiddleware(['staff']), EmployeeController.getEmployeesMappedToSameSuperAdmin);


module.exports = router;
