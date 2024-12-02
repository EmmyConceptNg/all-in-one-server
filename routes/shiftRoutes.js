const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const shiftController = require('../controllers/shiftController');

router.post('/add', authMiddleware(['super_admin', 'manager', 'staff']), shiftController.addShift);
router.get('/user', authMiddleware(['owner', 'super_admin', 'manager', 'staff']), shiftController.getShifts);
router.delete('/:id', authMiddleware(['super_admin', 'manager', 'staff']), shiftController.deleteShift);

module.exports = router;
