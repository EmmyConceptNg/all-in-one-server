const express = require('express');
const router = express.Router();
const VacationController = require('../controllers/vacationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/request', 
  authMiddleware(['staff', 'manager']), 
  VacationController.requestVacation
);

router.put('/:id/status', 
  authMiddleware(['super_admin', 'manager']), 
  VacationController.updateVacationStatus
);

router.get('/', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  VacationController.getVacations
);

router.delete('/:id', 
  authMiddleware(['super_admin', 'manager', 'staff']), 
  VacationController.deleteVacation
);

module.exports = router;
