const Workspace = require('../models/Workspace');
const Employee = require('../models/Employee');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Project = require('../models/Project');
const Contract = require('../models/Contracts');
const TimeTracker = require('../models/TimeTracker');
const Shift = require('../models/Shifts');
const Vacation = require('../models/Vacation'); // Add this line

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
    const vacations = await Vacation.find({ superAdminId: req.userId }).populate('userId', 'firstName lastName'); // Add this line

    for (const manager of managers) {
      
      const managerContracts = await Contract.find({ employee: manager?._id });
      const managerProjects = await Project.find({ createdBy: manager?._id });
      const managerSchedules = await Schedule.find({ userId: manager?._id });
      const managerShifts = shifts.filter(shift => {
        if(shift.userId != null){
console.log(shift);
          String(shift?.userId?._id) === String(manager?._id)
        }
      });
      const managerVacations = vacations.filter(vacation => 
        vacation.userId && String(vacation.userId._id) === String(manager._id)
      );
      
      manager.contracts = managerContracts;
      manager.projects = managerProjects;
      manager.schedules = managerSchedules;
      manager.shifts = managerShifts;
      manager.vacations = managerVacations; // Add this line
    }

    for (const employee of regularEmployees) {
      // console.log(employee);
      const employeeContracts = await Contract.find({ employee: employee?._id });
      const employeeProjects = await Project.find({ createdBy: employee?._id });
      const employeeSchedules = await Schedule.find({ userId: employee?._id });
      const employeeShifts = shifts.filter(shift => {
        if(shift.userId != null){
          console.log(shift)
        String(shift?.userId?._id) === String(employee?._id)
        }
      });
      const employeeVacations = vacations.filter(vacation => 
        vacation.userId && String(vacation.userId._id) === String(employee._id)
      );

      employee.contracts = employeeContracts;
      employee.projects = employeeProjects;
      employee.schedules = employeeSchedules;
      employee.shifts = employeeShifts;
      employee.vacations = employeeVacations; // Add this line
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
      timeEntries,
      vacations // Add this line
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = {
  getAllMappedDetails
};