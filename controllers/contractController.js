const Contract = require('../models/Contracts');
const Employee = require('../models/Employee');
const { getSuperAdminIdForStaff } = require('../utils/userUtils');

exports.addContract = async (req, res) => {
  try {
    if (!req.body.employeeId) {
      return res.status(400).json({ message: 'Employee ID not found in request body' });
    }

    const { employeeId, startDate, managingDirector, address, contractType, endDate } = req.body;

    let superAdminId = await getSuperAdminIdForStaff(employeeId);

    if (!superAdminId) {
      superAdminId = "default_super_admin_id"; 
    }


    // const superAdminId = await getSuperAdminIdForStaff(employeeId);

    // if (!superAdminId) {
    //   return res.status(404).json({ message: 'Super Admin ID not found for the staff member' });
    // }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const newContract = new Contract({
      employeeId,
      startDate,
      managingDirector,
      address,
      contractType,
      endDate,
      superAdminId,
      employeeDetails: employee 
    });

    await newContract.save();

    res.status(201).json({ message: "Contract created successfully", contract: newContract });
  } catch (error) {
    console.error("Error creating contract:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.terminateContract = async (req, res) => {
  const contractId = req.params.id;

  try {
    const terminatedContract = await Contract.findByIdAndUpdate(contractId, { contractStatus: 'terminated' }, { new: true });

    if (!terminatedContract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    res.status(200).json({ message: 'Contract terminated successfully', contract: terminatedContract });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getContracts = async (req, res) => {
  try {
    let contracts = [];

    if (req.userRole === "super_admin") {
      contracts = await Contract.find();
    } else if (req.userRole === "manager") {
      contracts = await Contract.find({ employeeId: { $in: req.managerEmployeeIds } });
    }

    res.status(200).json({ contracts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};