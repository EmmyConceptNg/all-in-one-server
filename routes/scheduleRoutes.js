const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/add', authMiddleware(['super_admin', 'manager', 'staff']), scheduleController.addSchedule);
router.get('/user', authMiddleware(['owner', 'super_admin', 'manager', 'staff']), scheduleController.getUserSchedules);
router.delete('/:id', authMiddleware(['super_admin', 'manager', 'staff']), scheduleController.deleteSchedule);

module.exports = router;