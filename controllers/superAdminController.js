const Workspace = require('../models/Workspace');
const Employee = require('../models/Employee');
const Schedule = require('../models/Schedule');

async function getAllMappedDetails(req, res) {
  try {
    const employees = await Employee.find({ superAdminId: req.userId });
    const workspaces = await Workspace.find({ createdBy: req.userId });
    const schedules = await Schedule.find({ userId: { $in: employees.map(employee => employee.userId) } });
    const managers = employees.filter(employee => employee.role === 'manager');
    const regularEmployees = employees.filter(employee => employee.role === 'staff');

    res.status(200).json({ managers, regularEmployees, workspaces, schedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = {
  getAllMappedDetails
};