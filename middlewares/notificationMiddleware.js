const notificationController = require('../controllers/notificationController');

exports.sendNotification = async (recipientId, message) => {
  try {
    await notificationController.createNotification(recipientId, message);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};