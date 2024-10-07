const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware(['manager', 'super_admin']), contractController.createContract);
router.get('/employee/:employeeId', authMiddleware(['manager', 'super_admin', 'staff']), contractController.getEmployeeContracts);
router.get('/all', authMiddleware(['manager', 'super_admin']), contractController.getAllContracts);

module.exports = router;
