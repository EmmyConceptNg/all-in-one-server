const User = require('../models/User');

async function getSuperAdminIdForStaff(userId) {
  try {
    const staff = await User.findById(userId);
    if (staff) {
      return staff.superAdminId; 
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching superAdminId for staff:", error);
    return null;
  }
}

module.exports = { getSuperAdminIdForStaff };