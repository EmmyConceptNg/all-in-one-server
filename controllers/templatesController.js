const path = require("path");
const Template = require("../models/Template");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const Employee = require("../models/Employee");
const EmployeeTemplate = require("../models/EmployeeTemplate");

exports.uploadFile = async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "File path not provided" });
  }

  try {
    const newUpload = new Template({
      employeeId: req.userId,
      filePath: path.resolve(req.file.path),
      fileName: req.file.filename,
      fileSize: req.file.size,
    });

    await newUpload.save();

    return res.status(200).json({
      message: "PDF file uploaded successfully",
      newUpload,
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({
      message: "Internal server error. Please check the logs for more details.",
    });
  }
};

exports.fetchUserTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ employeeId: req.userId });
    res
      .status(200)
      .json({
        message: "successfully fetch all templates for a user",
        templates,
      });
  } catch (error) {
    res.status(500).json({ error });
  }
};
exports.deleteTemplate = async (req, res) => {
  try {
    const deleteTemplate = await Template.findOneAndDelete({ _id: req.params.templateId });
   if(deleteTemplate){
     res.status(200).json({
       message: "Template successfully deleted",
     });
   }
  } catch (error) {
    res.status(500).json({ error });
  }
};


exports.assignTemplate = async(req, res) => {
  const { startDate, endDate, employeeId, type, templateId } = req.body;
const managerDetails = await Employee.findOne({_id :req.userId})
const employee = await Employee.findOne({ _id: employeeId });


  
const contractDetails = {
  startDate,
  endDate,
  type,
};

  try{
    await useTemplate(templateId, employee, contractDetails, managerDetails);
  }catch(error){
    res.status(500).json({error})
  }
}





async function useTemplate(
  templateId,
  employeeData,
  contractDetails,
  managerDetails
) {
  try {
    // Step 1: Fetch the template
    const template = await fetchTemplateById(templateId);
    const pdfPath = template.filePath;

    // Step 2: Extract text from the PDF using OCR
    const extractedContent = await extractTextFromPDF(pdfPath);

    // Step 3: Replace placeholders in the template with employee details
    const modifiedContent = replaceTemplateFields(
      extractedContent,
      employeeData,
      contractDetails,
      managerDetails
    );

    // Step 4: Generate a new PDF with modified content
    const newFileName = `employeeTemplate-${Date.now()}.pdf`;
    const newPdfPath = path.join(__dirname, "uploads", newFileName);
    await createPDF(modifiedContent, newPdfPath);

    // Step 5: Save the details in the DB
    const employeeTemplateData = {
      content: modifiedContent,
      filepath: newPdfPath,
      startDate: contractDetails.startDate,
      employeeId: employeeData._id,
      type: contractDetails.type, 
      endDate: contractDetails.endDate, 
    };

    const savedTemplate = await saveEmployeeTemplate(employeeTemplateData);

    const addToEmployee = await Employee.findOne({_id:employeeData._id});
    addToEmployee.templates.push(savedTemplate._id);
    await addToEmployee.save();

    return savedTemplate;
  } catch (error) {
    console.error("Error in useTemplate:", error);
    throw new Error("Failed to use template");
  }
}









async function fetchTemplateById(templateId) {
  try {
    const template = await Template.findById(templateId);
    if (!template) {
      throw new Error("Template not found");
    }
    return template;
  } catch (error) {
    throw new Error("Error fetching template: " + error.message);
  }
}


async function extractTextFromPDF(pdfPath) {
  try {
    const worker = Tesseract.createWorker();
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    const {
      data: { text },
    } = await worker.recognize(pdfPath);
    await worker.terminate();

    return text;
  } catch (error) {
    throw new Error("Error extracting text from PDF: " + error.message);
  }
}


function replaceTemplateFields(content, employeeData) {
  let modifiedContent = content;
  modifiedContent = modifiedContent.replace(
    /{{firstname}}/g,
    employeeData.firstName
  );
  modifiedContent = modifiedContent.replace(
    /{{lastname}}/g,
    employeeData.lastName
  );
  // Replace other fields as necessary
  return modifiedContent;
}




function createPDF(content, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);
    doc.text(content); // Add the modified content to the PDF
    doc.end();

    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
}


async function saveEmployeeTemplate(data) {
  const employeeTemplate = new EmployeeTemplate(data);
  await employeeTemplate.save();
  return employeeTemplate;
}