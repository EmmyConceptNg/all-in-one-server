const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create event
router.post(
  '/create',
  authMiddleware(['super_admin', 'manager']),
  eventController.createEvent
);

// Update event
router.put(
  '/:id',
  authMiddleware(['super_admin', 'manager']),
  eventController.updateEvent
);

// Delete event
router.delete(
  '/:id',
  authMiddleware(['super_admin', 'manager']),
  eventController.deleteEvent
);

module.exports = router;
