
const Employee = require('../models/Employee');
const { calculateWorkingDays } = require('../utils/dateUtils');
const User = require('../models/User');
const SickLeave = require('../models/SickLeave');

exports.requestSickLeave = async (req, res) => {
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
        message: 'Requested sick leave days exceed your annual allowance' 
      });
    }

    const newLeave = new SickLeave({
      userId: user?._id,
      superAdminId: employee ? employee?.superAdminId : user?.superAdminId,
      workspaceId: employee?.workspaceId,
      startDate,
      endDate,
      workingDaysCount: workingDays,
      notes
    });

    await newLeave.save();

    res.status(201).json({ 
      message: 'Sick leave created successfully', 
      sickLeave: newLeave 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSickLeave = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Find the sick leave first
    const sickLeave = await SickLeave.findOne({
      _id: id,
    });

    if (!sickLeave) {
      return res.status(404).json({
        message: "Sick leave not found or unauthorized",
      });
    }

    // If dates are being updated, recalculate working days
    if (updates.startDate || updates.endDate) {
      const startDate = updates.startDate || sickLeave.startDate;
      const endDate = updates.endDate || sickLeave.endDate;
      updates.workingDaysCount = calculateWorkingDays(startDate, endDate);

      // Check if new dates exceed sickLeave allowance

      const user = await User.findOne({ _id: sickLeave.userId });
      const employee = await Employee.findOne({ email: user?.email });
      if (updates.workingDaysCount > employee?.annualVacationDays) {
        return res.status(400).json({
          message: "Updated sick leave days would exceed annual allowance",
        });
      }
    }

    // Only super_admin or manager can update status
    if (updates.status && req.userRole === "staff") {
      return res.status(403).json({
        message: "Staff cannot update sick leave status",
      });
    }

    // Update the sick leave with all provided fields
    const updatedSickLeave = await SickLeave.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).populate("userId", "firstName lastName");

    res.status(200).json({
      message: "sick leave updated successfully",
      sickLeave: updatedSickLeave,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSickLeaves = async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};

    switch (req.userRole) {
      case "super_admin":
        if (userId) {
          query.userId = userId;
          query.superAdminId = req.userId;
        } else {
          // Get both super admin's sick leaves and their staff's sick leaves
          const user = await User.findById(req.userId);
          query = {
            $or: [
              { superAdminId: req.userId }, // Get all staff sick leaves
              { userId: req.userId }, // Get super admin's own sick leaves
            ],
          };
        }
        break;

      case "manager":
        const manager = await Employee.findOne({ email: req.user.email });
        if (!manager?.workspaceId) {
          return res
            .status(404)
            .json({ message: "Manager workspace not found" });
        }

        if (userId) {
          // Verify the requested user is in manager's workspace
          const employee = await Employee.findOne({
            _id: userId,
            workspaceId: manager.workspaceId,
          });
          if (!employee) {
            return res.status(403).json({
              message: "Unauthorized to view this employee's sick leaves",
            });
          }
          query.userId = userId;
        } else {
          // Get both manager's sick leaves and their staff's sick leaves
          const staffInWorkspace = await Employee.find({
            workspaceId: manager.workspaceId,
            role: "staff",
          });
          query = {
            $or: [
              { userId: { $in: staffInWorkspace.map((staff) => staff._id) } }, // Staff sick leaves
              { userId: req.userId }, // Manager's own sick leaves
            ],
          };
        }
        break;

      case "staff":
        query = { userId: req.userId };
        break;

      default:
        return res.status(403).json({ message: "Unauthorized access" });
    }

    const sickLeaves = await SickLeave.find(query)
      .populate("userId", "firstName lastName email")
      .populate("workspaceId", "name")
      .sort({ startDate: -1 });

    res.status(200).json({
      sickLeaves,
      count: sickLeaves.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteSickLeave = async (req, res) => {
  const { id } = req.params;

  try {
    // const query = req.userRole === 'super_admin'
    //   ? { _id: id, superAdminId: req.userId }
    //   : { _id: id, userId: req.userId, status: 'pending' };

    const deletedSickLeave = await SickLeave.findOneAndDelete({ _id: id });

    if (!deletedSickLeave) {
      return res.status(404).json({ 
        message: 'Sick leave request not found or cannot be deleted' 
      });
    }

    res.status(200).json({
      message: "Sick leave request deleted successfully",
      sickLeave: deletedSickLeave,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
