const Contract = require('../models/Contracts');
const Employee = require('../models/Employee');

exports.createContract = async (req, res) => {
  const { employeeId, startDate, endDate, managingDirector, address } = req.body;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const newContract = new Contract({
      employee: employeeId,
      startDate,
      endDate,
      managingDirector,
      address,
      createdBy: req.userId,
    });

    await newContract.save();
    res.status(201).json({ message: 'Contract created successfully', contract: newContract });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEmployeeContracts = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const contracts = await Contract.find({ employee: employeeId }).populate('employee', 'firstName lastName email gender email houseNumber dateOfBirth nationality tin ssn healthInsurance IBAN BIC jobType');
    res.status(200).json({ message: 'Contracts retrieved successfully', contracts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find().populate('employee', 'firstName lastName email gender email houseNumber dateOfBirth nationality tin ssn healthInsurance IBAN BIC jobType');
    res.status(200).json({ message: 'All contracts retrieved successfully', contracts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
