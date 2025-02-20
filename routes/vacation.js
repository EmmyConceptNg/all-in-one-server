const express = require('express');
const router = express.Router();
const VacationController = require('../controllers/vacationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create', 
  authMiddleware(['staff', 'manager', 'super_admin']), 
  VacationController.requestVacation
);

router.put('/:id', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  VacationController.updateVacation
);

// Simplified route that uses query parameters instead
router.get('/', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  VacationController.getVacations
);

router.delete('/:id', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  VacationController.deleteVacation
);

module.exports = router;
