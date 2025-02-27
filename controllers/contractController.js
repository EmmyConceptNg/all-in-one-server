const Contract = require("../models/Contracts");
const Employee = require("../models/Employee");
const { getSuperAdminIdForStaff } = require("../utils/userUtils");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const EmployeeTemplate = require("../models/EmployeeTemplate");
const pdf = require("html-pdf");


exports.addContract = async (req, res) => {
  try {
    if (!req.body.employeeId) {
      return res
        .status(400)
        .json({ message: "Employee ID not found in request body" });
    }

    if (req.userRole !== "manager" && req.userRole !== "super_admin") {
      return res
        .status(403)
        .json({ message: "You do not have the required permissions" });
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

    const pdfFileName = `${employeeId}-${Date.now()}-contract.pdf`;
    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const relativeFilePath = `/uploads/${pdfFileName}`;
    const absoluteFilePath = path.join(__dirname, "..", "uploads", pdfFileName);

    const pdfOptions = {
      format: "A4",
      border: {
        top: "1in",
        right: "0.75in",
        bottom: "1in",
        left: "0.75in",
      },
      timeout: 300000,
    };

    // Ensure req.file is defined
    if (!req.file) {
      return res.status(400).json({ message: "Logo image is required" });
    }

    // Convert logo image to Base64
    const logoPath = req.file.path;
    const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
    const logoDataUrl = `data:image/png;base64,${logoBase64}`;

    const htmlContent = `
      <div style="text-align: center;">
        <img src="${logoDataUrl}" alt="Logo" style="width: 150px; height: auto;"/>
      </div>
      ${content}
    `;

    pdf
      .create(htmlContent, pdfOptions)
      .toFile(absoluteFilePath, async (err, result) => {
        if (err) {
          console.error("Error generating PDF:", err);
          return res.status(500).json({ message: "Error generating PDF" });
        }

        const employeeTemplate = new EmployeeTemplate({
          content,
          filepath: `${baseUrl}${relativeFilePath}`,
          startDate,
          employeeId,
          type: contractType,
          endDate,
        });

        await employeeTemplate.save();

        newContract.file = employeeTemplate._id;
        await newContract.save();

        await Employee.findByIdAndUpdate(employeeId, {
          $push: { templates: employeeTemplate._id },
        });

        res.status(201).json({
          message: "Contract created successfully",
          contract: newContract,
        });
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

    // PDF generation
    const pdfFileName = `contract_${newContract._id}.pdf`;
    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const relativeFilePath = `/uploads/${pdfFileName}`;
    const absoluteFilePath = path.join(__dirname, "..", "uploads", pdfFileName);

    const pdfOptions = {
      format: "A4",
      border: {
        top: "1in",
        right: "0.75in",
        bottom: "1in",
        left: "0.75in",
      },
    };

    pdf
      .create(existingContract.content, pdfOptions)
      .toFile(absoluteFilePath, async (err, result) => {
        if (err) {
          console.error("Error generating PDF:", err);
          return res.status(500).json({ message: "Error generating PDF" });
        }

        // Save the template record
        const newTemplate = new EmployeeTemplate({
          content: existingContract.content,
          filepath: `${baseUrl}${relativeFilePath}`,
          startDate: newContract.startDate,
          employeeId: existingContract.employee,
          type: newContract.contractType,
          endDate: newContract.endDate,
        });

        await newTemplate.save();

        // Assign the ObjectId to the file field
        newContract.file = newTemplate._id;
        await newContract.save();
        existingContract.contractStatus = "extended";
        await existingContract.save();

        res.status(201).json({
          message: "Contract extended successfully",
          contract: newContract,
        });
      });
  } catch (error) {
    console.error("Error extending contract:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.terminateContract = async (req, res) => {
  const contractId = req.params.id;

  try {
    const terminatedContract = await Contract.findByIdAndUpdate(
      contractId,
      { contractStatus: "terminated" },
      { new: true }
    );

    if (!terminatedContract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    res
      .status(200)
      .json({
        message: "Contract terminated successfully",
        contract: terminatedContract,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getContracts = async (req, res) => {
  try {
    let contracts = [];

    if (req.userRole === "super_admin") {
      contracts = await Contract.find({ superAdminId: req.userId }).populate([
        "employee", "file",
      ]);
    } else if (req.userRole === "manager") {
      contracts = await Contract.find({
        employeeId: { $in: req.managerEmployeeIds },
      }).populate(["employee", "file"]);
    }

    res.status(200).json({ contracts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
