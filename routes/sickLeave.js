const express = require('express');
const router = express.Router();
const SickLeaveController = require('../controllers/sickLeaveController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create', 
  authMiddleware(['staff', 'manager', 'super_admin']), 
  SickLeaveController.requestVacation
);

router.put('/:id', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  SickLeaveController.updateVacation
);

// Simplified route that uses query parameters instead
router.get('/', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  SickLeaveController.getVacations
);

router.delete('/:id', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  SickLeaveController.deleteVacation
);

module.exports = router;
