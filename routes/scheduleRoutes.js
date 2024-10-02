const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/add', authMiddleware, scheduleController.addSchedule);

router.get('/user', authMiddleware, scheduleController.getUserSchedules);

router.delete('/:id', authMiddleware, scheduleController.deleteSchedule);

module.exports = router;
