const Shift = require('../models/Shifts');
const Employee = require('../models/Employee');
const { getSuperAdminIdForStaff } = require('../utils/userUtils');

exports.addShift = async (req, res) => {
    const { userId, startDate, endDate, startTime, endTime, pauseTime, workspaceId, occurrence, notes } = req.body;
  
    try {
      const userRole = req.userRole;
      let targetUserId = userId || req.userId; 
  
      if (userRole === 'super_admin') {
        if (!workspaceId) {
          return res.status(400).json({ message: 'Workspace ID is required for super_admin to create shifts' });
        }
      } else if (userRole === 'staff') {
        const employee = await Employee.findOne({ _id: targetUserId });
        if (!employee || !employee?.workspaceId) {
          return res.status(400).json({ message: 'Employee does not exist or does not belong to a workspace' });
        }
      } else {
        return res.status(403).json({ message: 'You do not have the required permissions to create a shift' });
      }
  
      const newShift = new Shift({
        userId: targetUserId,
        superAdminId: req.userRole === 'super_admin' ? req.userId : null,
        startDate,
        endDate,
        startTime,
        endTime,
        pauseTime,
        workspaceId: workspaceId || Employee?.workspaceId,
        occurrence,
        notes,
      });
  
      await newShift.save();
  
      res.status(201).json({ message: 'Shift created successfully', shift: newShift });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

exports.getShifts = async (req, res) => {
  try {
    const query = req.userRole === 'superadmin' 
      ? { superAdminId: req.userId } 
      : { userId: req.userId };

    const shifts = await Shift.find(query).populate('userId', 'firstName lastName');

    res.status(200).json({ shifts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteShift = async (req, res) => {
  const shiftId = req.params.id;

  try {
    const query = req.userRole === 'superadmin' 
      ? { _id: shiftId, superAdminId: req.userId }
      : { _id: shiftId, userId: req.userId };

    const deletedShift = await Shift.findOneAndDelete(query);

    if (!deletedShift) {
      return res.status(404).json({ message: 'Shift not found or you do not have permission to delete this shift' });
    }

    res.status(200).json({ message: 'Shift deleted successfully', shift: deletedShift });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
