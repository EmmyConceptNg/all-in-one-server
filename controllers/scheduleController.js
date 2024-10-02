const Schedule = require('../models/Schedule');

exports.addSchedule = async (req, res) => {
    const { scheduleType, startDate, endDate, notes } = req.body; 
  
    try {
      const newSchedule = new Schedule({
        userId: req.userId, 
        scheduleType,
        startDate,
        endDate,
        notes, 
      });
  
      await newSchedule.save();
      res.status(201).json({ message: "Schedule added successfully", schedule: newSchedule });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

exports.getUserSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.userId });
    res.status(200).json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteSchedule = async (req, res) => {
    const { id } = req.params;
  
    try {
      const schedule = await Schedule.findById(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
  
      if (schedule.userId.toString() !== req.userId) {
        return res.status(403).json({ message: "You are not authorized to delete this schedule" });
      }
  
      await Schedule.deleteOne({ _id: id });
  
      res.status(200).json({ message: "Schedule deleted successfully" });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  