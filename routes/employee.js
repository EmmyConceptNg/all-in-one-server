const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employeeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/add', authMiddleware(['super_admin', 'manager']), EmployeeController.addEmployee);
router.put('/edit/:id', authMiddleware(['super_admin', 'manager']), EmployeeController.editEmployee);
router.delete('/:id', 
  [
    authMiddleware(['super_admin', 'manager']),
    (req, res, next) => {
      const { deletionType } = req.body;
      if (!deletionType || !['retain', 'remove'].includes(deletionType)) {
        return res.status(400).json({ message: "Invalid deletion type. Must be 'retain' or 'remove'" });
      }
      next();
    }
  ], 
  EmployeeController.deleteEmployee
);
router.get('/all', authMiddleware(['owner', 'super_admin', 'manager', 'staff']), EmployeeController.getAllEmployeesBySuperAdmin);
// router.get('/staff', authMiddleware(['staff']), EmployeeController.getEmployeesMappedToSameSuperAdmin);

module.exports = router;
