const path = require("path");
const Template = require("../models/Template");
const fs = require("fs");
const Employee = require("../models/Employee");
const EmployeeTemplate = require("../models/EmployeeTemplate");
const pdf = require("html-pdf");
const { PDFDocument } = require("pdf-lib");
const axios = require("axios");
const FormData = require("form-data");
const Contract = require("../models/Contracts");
const moment = require("moment");


exports.uploadFile = async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "File path not provided" });
  }

  try {
    const baseUrl = process.env.BASE_URL; 
    const relativeFilePath = `/uploads/${req.file.filename}`; 

    const newUpload = new Template({
      employeeId: req.userId,
      filePath: `${baseUrl}${relativeFilePath}`, 
      fileName: req.file.originalname,
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
  const { startDate, endDate, employeeId, contractType, templateId } = req.body;
const managerDetails = await Employee.findOne({ superAdminId: req.userId });
const employee = await Employee.findOne({ _id: employeeId });


  
const contractDetails = {
  startDate,
  endDate,
  contractType,
};

  try{
    const usedTemplate = await useTemplate(templateId, employee, contractDetails, managerDetails, req);
    if(usedTemplate){
      res
        .status(200)
        .json({ message: "Message assigned successfully", usedTemplate });
    }
  }catch(error){
    res.status(500).json({error})
  }
}






async function useTemplate(
  templateId,
  employeeData,
  contractDetails,
  managerDetails,
  req
) {
  try {
    // Step 1: Fetch the template
    const template = await fetchTemplateById(templateId);
    const pdfUrl = template.filePath;

    // Step 2: Extract text from the PDF using OCR

    const extractedContent = await convertPdfToText(pdfUrl);

    // Step 3: Replace placeholders in the template with employee details
    const modifiedContent = replaceTemplateFields(
      extractedContent,
      employeeData,
      contractDetails,
      managerDetails
    );

    // Step 4: Generate a new PDF with modified content
    const newFileName = `employeeTemplate-${Date.now()}.pdf`;

    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const relativeFilePath = `/uploads/${newFileName}`;
    const absoluteFilePath = path.join(__dirname, "..", "uploads", newFileName);

    // PDF options with margins
    const pdfOptions = {
      format: "A4",
      border: {
        top: "1in", // 1 inch margin
        right: "0.75in",
        bottom: "1in",
        left: "0.75in",
      },
    };

    console.log("Generating pdf form  template >>>");
    // Generate PDF from HTML content with margins
    await new Promise((resolve, reject) => {
      console.log("Starting PDF creation...");
      console.log("Content:", modifiedContent);
      console.log("Options:", pdfOptions);
      console.log("File Path:", absoluteFilePath);

      pdf
        .create(modifiedContent, pdfOptions)
        .toFile(absoluteFilePath, (err, res) => {
          if (err) {
            console.error("Error creating PDF:", err);
            reject(err);
          } else {
            console.log("PDF created successfully:", res);
            resolve(res);
          }
        });
    });


    // console.log("contract details", contractDetails);

    // Step 5: Save the details in the DB
    const employeeTemplateData = {
      content: modifiedContent,
      filepath: `${baseUrl}${relativeFilePath}`,
      startDate: contractDetails.startDate,
      employeeId: employeeData._id,
      type: contractDetails.contractType,
      endDate: contractDetails.endDate,
    };


    const newContract = new Contract({
      employee: employeeData._id,
      startDate: contractDetails.startDate,
      managingDirector: managerDetails._id,
      contractType: contractDetails.contractType,
      endDate: contractDetails.endDate,
      content: modifiedContent,
      superAdminId:req.userId
    });



    console.log('Saving template >>>')
    const savedTemplate = await saveEmployeeTemplate(employeeTemplateData);

    // Add the new template to the employee's record

    newContract.file = savedTemplate._id;
    await newContract.save();

    const addToEmployee = await Employee.findOne({ _id: employeeData._id });
    addToEmployee.templates.push(newContract._id);
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





const convertPdfToText = async (pdfPath) => {
  const apiKey = process.env.OCR_API;

  try {
    const baseUrls = [
      "http://localhost:5555",
      "https://all-in-one-hr.onrender.com",
    ];

    let relativePath = pdfPath;
    baseUrls.forEach((baseUrl) => {
      if (pdfPath.startsWith(baseUrl)) {
        relativePath = pdfPath.replace(baseUrl, "");
      }
    });

    const localFilePath = `.${relativePath}`;
    const pdfBuffer = fs.readFileSync(localFilePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const numPages = pdfDoc.getPageCount();

    let combinedText = "";

    for (let i = 0; i < numPages; i++) {
      const singlePagePdf = await PDFDocument.create();
      const [page] = await singlePagePdf.copyPages(pdfDoc, [i]);
      singlePagePdf.addPage(page);
      const singlePagePdfBytes = await singlePagePdf.save();

      const form = new FormData();
      form.append("apikey", apiKey);
      form.append("isTable", "true");
      form.append("scale", "true");
      form.append("language", "eng");
      form.append("OCREngine", "1");
      form.append("file", Buffer.from(singlePagePdfBytes), "page.pdf");

      const { data: ocrResult } = await axios.post(
        "https://apipro1.ocr.space/parse/image",
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
        }
      );

      if (ocrResult.IsErroredOnProcessing) {
        console.error("Error during OCR processing:", ocrResult.ErrorMessage);
        continue;
      }

      // Use <br /> for HTML line breaks
      combinedText +=
        ocrResult.ParsedResults[0].ParsedText.replace(/\n/g, "<br /> <br />") +
        "<br /> <br />";
    }

    let result = combinedText.trim();

    return result;
  } catch (error) {
    console.error("Error processing text:", error);
    return null;
  }
};













function replaceTemplateFields(
  content,
  employeeData,
  contractDetails,
  mangerDetails
) {
  console.log("modifying >>>>>>", content);

  if (!content) {
    console.error("Content is undefined or null");
    return content;
  }

  let modifiedContent = content;

  const replacements = [
    { placeholder: /\[manager firstname\]/g, value: mangerDetails.firstName },
    { placeholder: /\[manager lastname\]/g, value: mangerDetails.lastName },
    {
      placeholder: /\[manger address\]/g,
      value: `${mangerDetails.address.houseNumber}, ${mangerDetails.address.street} Str, ${mangerDetails.address.city}`,
    },
    { placeholder: /\[employee firstname\]/g, value: employeeData.firstName },
    { placeholder: /\[employee lastname\]/g, value: employeeData.lastName },
    {
      placeholder: /\[house number\]/g,
      value: employeeData.address.houseNumber,
    },
    { placeholder: /\[street\]/g, value: employeeData.address.street },
    { placeholder: /\[city\]/g, value: employeeData.address.city },
    { placeholder: /\[start date\]/g, value: contractDetails.startDate },
    { placeholder: /\[end date\]/g, value: contractDetails.endDate },
    {
      placeholder: /\[dob\]/g,
      value: moment(employeeData.dateOfBirth).format("MMM Do YY"),
    },
    // Add more replacements as needed
  ];

  replacements.forEach(({ placeholder, value }) => {
    if (value !== undefined && value !== null) {
      modifiedContent = modifiedContent.replace(placeholder, value);
    }
  });

  console.log("done modifying >>>>>>");

  return modifiedContent;
}





async function saveEmployeeTemplate(data) {
  const employeeTemplate = new EmployeeTemplate(data);
  await employeeTemplate.save();
  return employeeTemplate;
}