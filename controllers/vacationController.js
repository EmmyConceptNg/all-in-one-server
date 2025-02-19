const Vacation = require('../models/Vacation');
const Employee = require('../models/Employee');
const { calculateWorkingDays } = require('../utils/dateUtils');

exports.requestVacation = async (req, res) => {
  const { startDate, endDate, notes } = req.body;

  try {
    const employee = await Employee.findOne({ userId: req.userId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const workingDays = calculateWorkingDays(startDate, endDate);
    
    if (workingDays > employee.annualVacationDays) {
      return res.status(400).json({ 
        message: 'Requested vacation days exceed your annual allowance' 
      });
    }

    const newVacation = new Vacation({
      userId: req.userId,
      superAdminId: employee.superAdminId,
      workspaceId: employee.workspaceId,
      startDate,
      endDate,
      workingDaysCount: workingDays,
      notes
    });

    await newVacation.save();

    res.status(201).json({ 
      message: 'Vacation request submitted successfully', 
      vacation: newVacation 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateVacationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const vacation = await Vacation.findOne({ 
      _id: id,
      superAdminId: req.userId
    });

    if (!vacation) {
      return res.status(404).json({ 
        message: 'Vacation request not found or unauthorized' 
      });
    }

    vacation.status = status;
    await vacation.save();

    res.status(200).json({ 
      message: 'Vacation status updated successfully', 
      vacation 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getVacations = async (req, res) => {
  try {
    const query = req.userRole === 'super_admin' 
      ? { superAdminId: req.userId }
      : { userId: req.userId };

    const vacations = await Vacation.find(query)
      .populate('userId', 'firstName lastName')
      .sort({ startDate: -1 });

    res.status(200).json({ vacations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteVacation = async (req, res) => {
  const { id } = req.params;

  try {
    const query = req.userRole === 'super_admin'
      ? { _id: id, superAdminId: req.userId }
      : { _id: id, userId: req.userId, status: 'pending' };

    const deletedVacation = await Vacation.findOneAndDelete(query);

    if (!deletedVacation) {
      return res.status(404).json({ 
        message: 'Vacation request not found or cannot be deleted' 
      });
    }

    res.status(200).json({ 
      message: 'Vacation request deleted successfully', 
      vacation: deletedVacation 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
