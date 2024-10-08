const Employee = require('../models/Employee');
const User = require('../models/User');

exports.addEmployee = async (req, res) => {
  const {
    firstName, middleName, lastName, postalCode, city, street, houseNumber,
    email, ssn, healthInsurance, tin, nationality, taxClass, dateOfBirth,
    countryOfBirth, placeOfBirth, maritalStatus, gender, isDisabled, hasChildren,
    childAllowance, religion, IBAN, BIC, entryDate, jobType, hasAnotherJob,
    isPartTime, workingHoursPerWeek, workingHoursPerMonth, annualVacationDays
  } = req.body;

  try {
    const newEmployee = new Employee({
      firstName, middleName, lastName, postalCode, city, street, houseNumber,
      email, ssn, healthInsurance, tin, nationality, taxClass, dateOfBirth,
      countryOfBirth, placeOfBirth, maritalStatus, gender, isDisabled, hasChildren,
      childAllowance, religion, IBAN, BIC, entryDate, jobType, hasAnotherJob,
      isPartTime, workingHoursPerWeek, workingHoursPerMonth, annualVacationDays
    });

    await newEmployee.save();

    const newUser = new User({ firstName, lastName, email, password: email, role: 'staff', isVerified: true, });

    await newUser.save();

    res.status(201).json({
      message: 'Employee and User account created successfully',
      employee: newEmployee,
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.editEmployee = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    try {
      const updatedEmployee = await Employee.findByIdAndUpdate(id, updates, { new: true });
  
      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedEmployee = await Employee.findByIdAndDelete(id);
  
      if (!deletedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  exports.getEmployee = async (req, res) => {
    const { id } = req.params;
  
    try {
      const employee = await Employee.findById(id);
  
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      res.status(200).json({ employee });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  exports.getAllEmployees = async (req, res) => {
    try {
      const employees = await Employee.find();
      res.status(200).json({ employees });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };