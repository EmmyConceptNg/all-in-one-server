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
  // Check if both files are uploaded
  if (!req.files || !req.files.pdfFile || !req.files.logoImage) {
    return res
      .status(400)
      .json({ message: "PDF file and logo image are required" });
  }

  try {
    const baseUrl = process.env.BASE_URL;
    const pdfFile = req.files.pdfFile[0];
    const logoImage = req.files.logoImage[0];

    const pdfFilePath = `/uploads/${pdfFile.filename}`;
    const logoImagePath = `/uploads/${logoImage.filename}`;

    const newUpload = new Template({
      employeeId: req.userId,
      filePath: `${baseUrl}${pdfFilePath}`,
      fileName: pdfFile.originalname,
      fileSize: pdfFile.size,
      logoPath: `${baseUrl}${logoImagePath}`, // Add logo path to the database
    });

    await newUpload.save();

    return res.status(200).json({
      message: "Files uploaded successfully",
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
    const template = await fetchTemplateById(templateId);
    const pdfUrl = template.filePath;
    const logoPath = path.join(
      __dirname,
      "..",
      "uploads",
      path.basename(template.logoPath)
    );

    // Convert logo to Base64
    const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
    const logoDataUrl = `data:image/png;base64,${logoBase64}`;

    const extractedContent = await convertPdfToText(pdfUrl);
    const modifiedContent = replaceTemplateFields(
      extractedContent,
      employeeData,
      contractDetails,
      managerDetails
    );

    const contentWithLogo = `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${logoDataUrl}" alt="Logo" style="max-width: 200px; height: auto;" />
      </div>
      ${modifiedContent}
    `;

    const newFileName = `employeeTemplate-${Date.now()}.pdf`;
    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const relativeFilePath = `/uploads/${newFileName}`;
    const absoluteFilePath = path.join(__dirname, "..", "uploads", newFileName);

    const pdfOptions = {
      format: "A4",
      border: {
        top: "1in",
        right: "0.75in",
        bottom: "1in",
        left: "0.75in",
      },
    };

    await new Promise((resolve, reject) => {
      pdf
        .create(contentWithLogo, pdfOptions)
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

    const employeeTemplateData = {
      content: contentWithLogo,
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
      content: contentWithLogo,
      superAdminId: req.userId,
    });

    const savedTemplate = await saveEmployeeTemplate(employeeTemplateData);
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
    { placeholder: /\[start date\]/g, value: contractDetails.startDate || 'unlimited' },
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