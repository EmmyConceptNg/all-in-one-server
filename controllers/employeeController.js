const Employee = require('../models/Employee');
const User = require('../models/User');

exports.addEmployee = async (req, res) => {
  const {
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
    });

    await newEmployee.save();

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: email, 
      role: 'staff', 
      isVerified: 'true'
    });

    await newUser.save();

    res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.editEmployee = async (req, res) => {
  const employeeId = req.params.id;
  const updateFields = req.body;

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(employeeId, updateFields, { new: true });

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  const employeeId = req.params.id;

  try {
    await Employee.findByIdAndDelete(employeeId);

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllEmployeesBySuperAdmin = async (req, res) => {
  try {
    if (req.userRole !== 'owner' && req.userRole !== 'super_admin') {
      return res.status(403).json({ message: 'You do not have the required permissions' });
    }

    const employees = await Employee.find();

    res.status(200).json({ employees });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
