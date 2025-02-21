const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create event
router.post(
  '/create',
  authMiddleware(['super_admin', 'manager', 'staff']),
  eventController.createEvent
);

// Update event
router.put(
  '/:id',
  authMiddleware(['super_admin', 'manager', 'staff']),
  eventController.updateEvent
);

// Delete event
router.delete(
  '/:id',
  authMiddleware(['super_admin', 'manager', 'staff']),
  eventController.deleteEvent
);

module.exports = router;
