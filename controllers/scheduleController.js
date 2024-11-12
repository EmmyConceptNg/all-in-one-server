const Employee = require('../models/Employee');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const { getSuperAdminIdForStaff } = require('../utils/userUtils');

exports.addSchedule = async (req, res) => {
  const { userId, scheduleType, startDate, endDate, startTime, endTime, occurrence, notes, workspaceId } = req.body;

  try {
    let targetUserId = userId || req.userId; 
    const superAdminId = await getSuperAdminIdForStaff(req.userId);

    if (!superAdminId) {
      return res.status(400).json({ message: 'Super Admin ID not found for the staff member' });
    }


    const user = await User.findById(userId)

    const employee = await Employee.findOne({email : user?.email})

    if(!employee){
      return res.status(400).json({message : "Employee does not belong to a workspace", userId})
    }

    const newSchedule = new Schedule({
      userId: targetUserId,
      superAdminId,
      scheduleType,
      startDate,
      endDate,
      startTime,
      endTime,
      occurrence,
      notes,
      workspaceId: employee?.workspaceId,
    });

    await newSchedule.save();

    res.status(201).json({ message: 'Schedule added successfully', schedule: newSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserSchedules = async (req, res) => {
  try {
    const userSchedules = await Schedule.find({ userId: req.userId }).populate('userId', 'firstName lastName');

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