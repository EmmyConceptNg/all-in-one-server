const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const leaveController = require('../controllers/leaveController');
const upload = require('../middlewares/uploadMiddleware'); // Assuming you have this for file uploads

// Vacation routes
router.post('/vacation', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  leaveController.requestVacation
);

// Sick leave routes
router.post('/sick-leave', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  upload.single('medicalCertificate'), 
  leaveController.requestSickLeave
);

// Common routes
router.get('/:type', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  leaveController.getLeaves
);

router.patch('/:type/:id/status/:status', 
  authMiddleware(['super_admin', 'manager']), 
  leaveController.updateLeaveStatus
);

module.exports = router;
