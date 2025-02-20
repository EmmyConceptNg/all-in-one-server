const Vacation = require('../models/Vacation');
const Employee = require('../models/Employee');
const { calculateWorkingDays } = require('../utils/dateUtils');
const User = require('../models/User');

exports.requestVacation = async (req, res) => {
  const { startDate, endDate, notes, userId } = req.body;

  

  try {
    const user = await User.findOne({ _id: userId });
    const employee = await Employee.findOne({ email: user?.email });
    // if (!employee) {
    //   return res.status(404).json({ message: 'Employee not found' });
    // }

    const workingDays = calculateWorkingDays(startDate, endDate);
    
    if (employee && workingDays > employee?.annualVacationDays) {
      return res.status(400).json({ 
        message: 'Requested vacation days exceed your annual allowance' 
      });
    }

    const newVacation = new Vacation({
      userId: user?._id,
      superAdminId: employee ? employee?.superAdminId : user?.superAdminId,
      workspaceId: employee?.workspaceId,
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

exports.updateVacation = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Find the vacation first
    const vacation = await Vacation.findOne({ 
      _id: id,
      [req.userRole === 'super_admin' ? 'superAdminId' : 'userId']: req.userId
    });

    if (!vacation) {
      return res.status(404).json({ 
        message: 'Vacation request not found or unauthorized' 
      });
    }

    // If dates are being updated, recalculate working days
    if (updates.startDate || updates.endDate) {
      const startDate = updates.startDate || vacation.startDate;
      const endDate = updates.endDate || vacation.endDate;
      updates.workingDaysCount = calculateWorkingDays(startDate, endDate);

      // Check if new dates exceed vacation allowance

      const user = await User.findOne({ _id: vacation.userId });
      const employee = await Employee.findOne({ email: user?.email });
      if (updates.workingDaysCount > employee.annualVacationDays) {
        return res.status(400).json({ 
          message: 'Updated vacation days would exceed annual allowance' 
        });
      }
    }

    // Only super_admin or manager can update status
    if (updates.status && req.userRole === 'staff') {
      return res.status(403).json({ 
        message: 'Staff cannot update vacation status' 
      });
    }

    // Update the vacation with all provided fields
    const updatedVacation = await Vacation.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).populate('userId', 'firstName lastName');

    res.status(200).json({ 
      message: 'Vacation updated successfully', 
      vacation: updatedVacation 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getVacations = async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};

    switch (req.userRole) {
      case 'super_admin':
        if (userId) {
          query.userId = userId;
          query.superAdminId = req.userId;
        } else {
          // Get both super admin's vacations and their staff's vacations
          const user = await User.findById(req.userId);
          query = {
            $or: [
              { superAdminId: req.userId }, // Get all staff vacations
              { userId: req.userId }         // Get super admin's own vacations
            ]
          };
        }
        break;

      case 'manager':
        const manager = await Employee.findOne({ email: req.user.email });
        if (!manager?.workspaceId) {
          return res.status(404).json({ message: 'Manager workspace not found' });
        }
        
        if (userId) {
          // Verify the requested user is in manager's workspace
          const employee = await Employee.findOne({
            _id: userId,
            workspaceId: manager.workspaceId
          });
          if (!employee) {
            return res.status(403).json({ message: 'Unauthorized to view this employee\'s vacations' });
          }
          query.userId = userId;
        } else {
          // Get both manager's vacations and their staff's vacations
          const staffInWorkspace = await Employee.find({ 
            workspaceId: manager.workspaceId,
            role: 'staff'
          });
          query = {
            $or: [
              { userId: { $in: staffInWorkspace.map(staff => staff._id) } }, // Staff vacations
              { userId: req.userId }                                         // Manager's own vacations
            ]
          };
        }
        break;

      case 'staff':
        query = { userId: req.userId };
        break;

      default:
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    const vacations = await Vacation.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('workspaceId', 'name')
      .sort({ startDate: -1 });

    res.status(200).json({ 
      vacations,
      count: vacations.length
    });
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
