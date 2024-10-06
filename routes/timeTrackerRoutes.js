const express = require('express');
const router = express.Router();
const timeTrackerController = require('../controllers/timeTrackerController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/start', authMiddleware(['staff', 'manager', 'super_admin']), timeTrackerController.startTimer);
router.post('/end', authMiddleware(['staff', 'manager', 'super_admin']), timeTrackerController.endTimer);
router.get('/all', authMiddleware(['staff', 'manager', 'super_admin']), timeTrackerController.getAllTimeEntries);

module.exports = router;
