const Workspace = require('../models/Workspace');
const Employee = require('../models/Employee');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Project = require('../models/Project');
const Contract = require('../models/Contracts');
const TimeTracker = require('../models/TimeTracker');

async function getAllMappedDetails(req, res) {
  try {
    const employees = await Employee.find({ superAdminId: req.userId });
    const workspaces = await Workspace.find({ createdBy: req.userId });
    const userObjects = await User.find({ superAdminId: req.userId });
    const schedules = await Schedule.find({ superAdminId: req.userId });
    const managers = employees.filter(employee => employee.role === 'manager');
    const regularEmployees = employees.filter(employee => employee.role === 'staff');
    const projects = await Project.find({ superAdminId: req.userId });
    const contracts = await Contract.find({ superAdminId: req.userId }).populate('employee');
    const timeEntries = await TimeTracker.find({ userId: { $in: userObjects.map(user => user._id) } });

    res.status(200).json({
      users: userObjects,
      managers,
      regularEmployees,
      workspaces,
      schedules,
      projects,
      contracts,
      timeEntries
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = {
  getAllMappedDetails
};