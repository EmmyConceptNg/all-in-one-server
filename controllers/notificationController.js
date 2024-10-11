const Notification = require('../models/Notification');

exports.createNotification = async (recipientId, message) => {
  try {
    const newNotification = new Notification({
      recipient: recipientId,
      message
    });

    await newNotification.save();

    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
};

exports.getNotifications = async () => {
    try {
      const notifications = await Notification.find();
      return notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new Error("Failed to fetch notifications");
    }
  };

module.exports = exports;