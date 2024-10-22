const User = require('../models/User');
const Employee = require('../models/Employee');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

async function getSuperAdminIdForStaff(userId) {
  try {
    let superAdminId = null;
    const user = await User.findById(userId);
    
    if (user) {
      superAdminId = user.superAdminId;
    } else {
      const employee = await Employee.findById(userId);
      if (employee) {
        superAdminId = employee.superAdminId;
      }
    }
    // causing an error on contract creation
    // if (superAdminId) {
    //   superAdminId = ObjectId(superAdminId);
    // }

    return superAdminId;
  } catch (error) {
    console.error("Error fetching superAdminId for staff:", error);
    return null;
  }
}

module.exports = { getSuperAdminIdForStaff };