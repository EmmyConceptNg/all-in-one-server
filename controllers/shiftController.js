const Shift = require('../models/Shifts');
const Employee = require('../models/Employee');
const { getSuperAdminIdForStaff } = require('../utils/userUtils');
const { generateDateArray, filterDatesByOccurrence } = require('../utils/dateUtils');

exports.addShift = async (req, res) => {
    const { userId, startDate, endDate, startTime, endTime, pauseTime, workspaceId, occurrence, notes } = req.body;
  
    try {
      // Validate dates
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

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
  
      // Generate array of dates and filter based on occurrence
      const allDates = generateDateArray(startDate, endDate);
      const filteredDates = filterDatesByOccurrence(allDates, occurrence);

      if (filteredDates.length === 0) {
        return res.status(400).json({ 
          message: 'No valid dates found for the given date range and occurrence pattern',
          debug: { startDate, endDate, occurrence, allDates }
        });
      }

      const newShift = new Shift({
        userId: targetUserId,
        superAdminId: req.userRole === 'super_admin' ? req.userId : null,
        startDate,
        endDate,
        dates: filteredDates, // Use filtered dates array
        startTime,
        endTime,
        pauseTime,
        workspaceId: workspaceId || Employee?.workspaceId,
        occurrence,
        notes,
      });
  
      await newShift.save();
  
      res.status(201).json({ 
        message: 'Shift created successfully', 
        shift: newShift,
        datesCount: filteredDates.length 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message,
        debug: { startDate, endDate, occurrence }
      });
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

exports.updateShift = async (req, res) => {
  const shiftId = req.params.id;
  const updates = req.body;
  
  try {
    // Find the shift and check permissions
    const query = req.userRole === 'superadmin' 
      ? { _id: shiftId, superAdminId: req.userId }
      : { _id: shiftId, userId: req.userId };

    const existingShift = await Shift.findOne(query);

    if (!existingShift) {
      return res.status(404).json({ 
        message: 'Shift not found or you do not have permission to update this shift' 
      });
    }

    // If dates or occurrence pattern is being updated, recalculate the dates array
    if (updates.startDate || updates.endDate || updates.occurrence) {
      const startDate = updates.startDate || existingShift.startDate;
      const endDate = updates.endDate || existingShift.endDate;
      const occurrence = updates.occurrence || existingShift.occurrence;

      const allDates = generateDateArray(startDate, endDate);
      const filteredDates = filterDatesByOccurrence(allDates, occurrence);

      if (filteredDates.length === 0) {
        return res.status(400).json({ 
          message: 'No valid dates found for the given date range and occurrence pattern' 
        });
      }

      updates.dates = filteredDates;
    }

    // Update the shift
    const updatedShift = await Shift.findOneAndUpdate(
      query,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: 'Shift updated successfully', 
      shift: updatedShift,
      datesCount: updatedShift.dates.length 
    });
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
