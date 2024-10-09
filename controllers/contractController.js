const Contract = require('../models/Contracts');
const Employee = require('../models/Employee');

exports.addContract = async (req, res) => {
  const { employeeId, startDate, endDate, managingDirector, address } = req.body;

  try {
    const newContract = new Contract({
      employeeId,
      startDate,
      endDate,
      managingDirector,
      address
    });

    await newContract.save();

    res.status(201).json({ message: "Contract created successfully", contract: newContract });
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