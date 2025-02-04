
const connectDB = require("../../config/db");
const Employee = require("../../models/Employee");
const User = require("../../models/User");

connectDB();
const updateDisabledField = async () => {
  try {
    await Promise.all([
      User.updateMany(
        { disabled: { $exists: false } },
        { $set: { disabled: false } }
      ),
      Employee.updateMany(
        { disabled: { $exists: false } },
        { $set: { disabled: false } }
      ),
    ]);
    console.log(
      "Updated all existing users and employees to include disabled: false"
    );
  } catch (error) {
    console.error("Error updating disabled field:", error);
  }
};

// Run the function
updateDisabledField();
