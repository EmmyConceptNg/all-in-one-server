const Schedule = require('../models/Schedule');

exports.addSchedule = async (req, res) => {
  const { scheduleType, startDate, endDate, notes, workspaceId } = req.body;

  try {
    const newSchedule = new Schedule({
      userId: req.userId,
      scheduleType,
      startDate,
      endDate,
      notes,
      workspaceId
    });

    await newSchedule.save();

    res.status(201).json({ message: 'Schedule added successfully', schedule: newSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserSchedules = async (req, res) => {
  try {
    const userSchedules = await Schedule.find({ userId: req.userId });

    res.status(200).json({ schedules: userSchedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  const scheduleId = req.params.id;

  try {
    const deletedSchedule = await Schedule.findOneAndDelete({ _id: scheduleId, userId: req.userId });

    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Schedule not found or you do not have permission to delete this schedule' });
    }

    res.status(200).json({ message: 'Schedule deleted successfully', schedule: deletedSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};