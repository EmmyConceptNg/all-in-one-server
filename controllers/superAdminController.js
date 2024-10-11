const Workspace = require('../models/Workspace');
const Employee = require('../models/Employee');
const Schedule = require('../models/Schedule');

async function getAllMappedDetails(req, res) {
  try {
    const employees = await Employee.find({ superAdminId: req.userId });
    const workspaces = await Workspace.find({ createdBy: req.userId });
    const schedules = await Schedule.find({ userId: { $in: employees.map(employee => employee.userId) } });

    res.status(200).json({ employees, workspaces, schedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = {
  getAllMappedDetails
};