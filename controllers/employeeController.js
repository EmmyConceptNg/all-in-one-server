const Employee = require("../models/Employee");
const User = require("../models/User");
const Workspace = require("../models/Workspace");
const { getSuperAdminIdForStaff } = require("../utils/userUtils");

exports.addEmployee = async (req, res) => {
  const {
    role,
    firstName,
    middleName,
    lastName,
    address,
    email,
    ssn,
    healthInsurance,
    tin,
    nationality,
    taxClass,
    dateOfBirth,
    countryOfBirth,
    placeOfBirth,
    maritalStatus,
    gender,
    disabled,
    children,
    childAllowance,
    religion,
    IBAN,
    BIC,
    entryDate,
    jobType,
    anotherJob,
    partTimeJob,
    workingHoursPerWeek,
    workingHoursPerMonth,
    annualVacationDays,
    workspaceId,
  } = req.body;

  try {
    const newEmployee = new Employee({
      superAdminId: req.userId,
      workspaceId,
      role,
      firstName,
      middleName,
      lastName,
      address,
      email,
      ssn,
      healthInsurance,
      tin,
      nationality,
      taxClass,
      dateOfBirth,
      countryOfBirth,
      placeOfBirth,
      maritalStatus,
      gender,
      disabled,
      children,
      childAllowance,
      religion,
      IBAN,
      BIC,
      entryDate,
      jobType,
      anotherJob,
      partTimeJob,
      workingHoursPerWeek,
      workingHoursPerMonth,
      annualVacationDays,
    });

    const savedEmployee = await newEmployee.save();
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: email,
      role,
      isVerified: true,
      superAdminId: req.userId,
    });

    const savedUser = await newUser.save();

    res
      .status(201)
      .json({
        message: "Employee added successfully",
        employee: savedEmployee,
        user: savedUser,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.editEmployee = async (req, res) => {
  const employeeId = req.params.id;
  const updateFields = req.body;

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      updateFields,
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res
      .status(200)
      .json({
        message: "Employee updated successfully",
        employee: updatedEmployee,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  const employeeId = req.params.id;
  const { deletionType } = req.body; // 'retain' or 'remove'

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (deletionType === 'retain') {
      // Set employee as disabled but retain their data
      await Employee.findByIdAndUpdate(employeeId, { 
        disabled: true 
      });
      
      // Disable associated user account
      await User.findOneAndUpdate(
        { email: employee.email },
        { disabled: true }
      );

    } else if (deletionType === 'remove') {
      // Delete employee and all associated data
      await Employee.findByIdAndDelete(employeeId);
      
      // Delete associated user account
      await User.findOneAndDelete({ email: employee.email });
      
      // Remove employee from all workspaces
      await Workspace.updateMany(
        { employees: employeeId },
        { $pull: { employees: employeeId } }
      );
    } else {
      return res.status(400).json({ message: "Invalid deletion type" });
    }

    res.status(200).json({ 
      message: deletionType === 'retain' 
        ? "Employee disabled successfully" 
        : "Employee deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllEmployeesBySuperAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const employee = await Employee.findOne({ email: user.email });
    

    let employees = [];

    if (req.userRole === "manager" || req.userRole === "staff") {
      if (employee.workspaceId) {
        employees = await Employee.find({
          workspaceId: employee.workspaceId,
        });
      }
    } else if (req.userRole === "super_admin") {
      employees = await Employee.find({ superAdminId: req.userId });
    } else {
      employees = await Employee.find();
    }

    res.status(200).json({ employees });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
