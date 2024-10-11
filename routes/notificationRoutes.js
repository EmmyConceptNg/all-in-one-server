const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/send", authMiddleware(["super_admin", "manager", "staff"]), async (req, res) => {
  const { recipientId, message } = req.body;

  try {
    const newNotification = await notificationController.createNotification(recipientId, message);
    res.status(201).json({ message: 'Notification created successfully', notification: newNotification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.get("/get", authMiddleware(["super_admin"]), async (req, res) => {
    try {
      const notifications = await notificationController.getNotifications();
      res.status(200).json({ notifications });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
module.exports = router;