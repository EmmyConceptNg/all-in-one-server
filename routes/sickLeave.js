const express = require('express');
const router = express.Router();
const SickLeaveController = require('../controllers/sickLeaveController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create', 
  authMiddleware(['staff', 'manager', 'super_admin']), 
  SickLeaveController.requestSickLeave
);

router.put('/:id', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  SickLeaveController.updateSickLeave
);

// Simplified route that uses query parameters instead
router.get('/', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  SickLeaveController.getSickLeaves
);

router.delete('/:id', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  SickLeaveController.deleteSickLeave
);

module.exports = router;
