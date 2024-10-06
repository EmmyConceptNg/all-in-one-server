const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employeeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/add', authMiddleware(['super_admin', 'manager']), EmployeeController.addEmployee);
router.put('/edit/:id', authMiddleware(['super_admin', 'manager']), EmployeeController.editEmployee);
router.delete('/delete/:id', authMiddleware(['super_admin', 'manager']), EmployeeController.deleteEmployee);
router.get('/view/:id', authMiddleware(), EmployeeController.getEmployee);
router.get('/all', authMiddleware(), EmployeeController.getAllEmployees);

module.exports = router;
