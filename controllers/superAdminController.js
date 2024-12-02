const Workspace = require('../models/Workspace');
const Employee = require('../models/Employee');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Project = require('../models/Project');
const Contract = require('../models/Contracts');
const TimeTracker = require('../models/TimeTracker');
const Shift = require('../models/Shifts'); 

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
    const shifts = await Shift.find({ superAdminId: req.userId }).populate('userId', 'firstName lastName').populate('workspaceId', 'name');
    const timeEntries = await TimeTracker.find({ userId: { $in: userObjects.map(user => user?._id) }});

    for (const manager of managers) {
      // console.log(managers);
      const managerContracts = await Contract.find({ employee: manager._id });
      const managerProjects = await Project.find({ createdBy: manager._id });
      const managerSchedules = await Schedule.find({ userId: manager._id });
      const managerShifts = shifts.filter(shift => String(shift.userId._id) === String(manager._id));

      manager.contracts = managerContracts;
      manager.projects = managerProjects;
      manager.schedules = managerSchedules;
      manager.shifts = managerShifts;
    }

    for (const employee of regularEmployees) {
      const employeeContracts = await Contract.find({ employee: employee._id });
      const employeeProjects = await Project.find({ createdBy: employee._id });
      const employeeSchedules = await Schedule.find({ userId: employee._id });
      const employeeShifts = shifts.filter(shift => String(shift.userId._id) === String(employee._id));

      employee.contracts = employeeContracts;
      employee.projects = employeeProjects;
      employee.schedules = employeeSchedules;
      employee.shifts = employeeShifts;
    }

    res.status(200).json({
      users: userObjects,
      managers,
      regularEmployees,
      workspaces,
      schedules,
      projects,
      contracts,
      shifts,
      timeEntries
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = {
  getAllMappedDetails
};