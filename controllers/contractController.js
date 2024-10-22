const Contract = require('../models/Contracts');
const Employee = require('../models/Employee');
const { getSuperAdminIdForStaff } = require('../utils/userUtils');
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit"); 
const EmployeeTemplate = require("../models/EmployeeTemplate");


exports.addContract = async (req, res) => {
  try {
    if (!req.body.employeeId) {
      return res
        .status(400)
        .json({ message: "Employee ID not found in request body" });
    }

    const {
      employeeId,
      startDate,
      managingDirector,
      address,
      contractType,
      endDate,
      content,
    } = req.body;

    let superAdminId = await getSuperAdminIdForStaff(employeeId);

    if (!superAdminId) {
      superAdminId = "default_super_admin_id";
    }

    // Create a new contract object
    const newContract = new Contract({
      employee: employeeId,
      startDate,
      managingDirector,
      address,
      contractType,
      endDate,
      superAdminId,
      content,
    });

    await newContract.save();

    // Generate PDF from content
    const doc = new PDFDocument();
    const pdfFileName = `${employeeId}-contract.pdf`;
    const pdfFilePath = path.join(__dirname, "..", "uploads", pdfFileName); // Adjust the path as necessary

    doc.pipe(fs.createWriteStream(pdfFilePath));
    doc.text(content); // You can format the content as needed
    doc.end();

    // Save the template in EmployeeTemplate
    const employeeTemplate = new EmployeeTemplate({
      content,
      filepath: pdfFilePath,
      startDate,
      employeeId,
      type: contractType,
      endDate,
    });

    await employeeTemplate.save();

    // Update Employee record with the new template reference
    await Employee.findByIdAndUpdate(employeeId, {
      $push: { templates: employeeTemplate._id },
    });

    res
      .status(201)
      .json({
        message: "Contract created successfully",
        contract: newContract,
      });
  } catch (error) {
    console.error("Error creating contract:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.extendContract = async (req, res) => {
  try {
    const { contractId, endDate } = req.body;

    if (!contractId || !endDate) {
      return res
        .status(400)
        .json({ message: "Contract ID and new end date are required" });
    }

    // Fetch the existing contract
    const existingContract = await Contract.findById(contractId);

    if (!existingContract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Create a new contract based on the existing contract
    const newContract = new Contract({
      employee: existingContract.employee,
      startDate: existingContract.startDate,
      managingDirector: existingContract.managingDirector,
      address: existingContract.address,
      contractType: existingContract.contractType,
      endDate: endDate,
      superAdminId: existingContract.superAdminId,
      content: existingContract.content,
      contractStatus: existingContract.contractStatus,
    });

    // Generate PDF from the contract content
    const pdfFilePath = path.join(
      __dirname,
      "../uploads",
      `contract_${newContract._id}.pdf`
    );
    const doc = new PDFDocument();

    // Create the PDF document
    doc.pipe(fs.createWriteStream(pdfFilePath));

    // Add content to the PDF
    doc.fontSize(12).text(`Content: ${existingContract.content}`, { align: "left" });

    // Finalize the PDF file
    doc.end();

    // Save the template record
    const newTemplate = new EmployeeTemplate({
      content: existingContract.content,
      filepath: pdfFilePath,
      startDate: newContract.startDate,
      employeeId: existingContract.employee,
      type: newContract.contractType,
      endDate: newContract.endDate,
    });

    await newTemplate.save();

    // Save the new contract
    await newContract.save();

    res.status(201).json({
      message: "Contract extended successfully",
      contract: newContract,
    });
  } catch (error) {
    console.error("Error extending contract:", error);
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
      contracts = await Contract.find({ superAdminId: req.userId }).populate(['employee']);
    } else if (req.userRole === "manager") {
      contracts = await Contract.find({ employeeId: { $in: req.managerEmployeeIds } }).populate(['employee']);
    }

    res.status(200).json({ contracts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};