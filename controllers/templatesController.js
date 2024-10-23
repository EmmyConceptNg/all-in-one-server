const path = require("path");
const Template = require("../models/Template");
const { createWorker } = require("tesseract.js");
const fs = require("fs");
const Employee = require("../models/Employee");
const EmployeeTemplate = require("../models/EmployeeTemplate");
const pdf = require("html-pdf");
const { PDFDocument } = require("pdf-lib");
const { createCanvas, Image } = require("canvas");
const axios = require("axios");
const sharp = require("sharp");


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
  const { startDate, endDate, employeeId, type, templateId } = req.body;
const managerDetails = await Employee.findOne({ superAdminId: req.userId });
const employee = await Employee.findOne({ _id: employeeId });


  
const contractDetails = {
  startDate,
  endDate,
  type,
};

  try{
    await useTemplate(templateId, employee, contractDetails, managerDetails, req);
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
    const pdfPath = template.filePath;

    // Step 2: Extract text from the PDF using OCR
    const extractedContent = await extractTextFromPDF(pdfPath);

    console.log("extracted content", extractedContent);

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
    const absoluteFilePath = path.join(__dirname, "uploads", newFileName);

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

    // Generate PDF from HTML content with margins
    await new Promise((resolve, reject) => {
      pdf
        .create(modifiedContent, pdfOptions)
        .toFile(absoluteFilePath, (err, res) => {
          if (err) {
            console.error("Error creating PDF:", err);
            reject(err);
          }
          resolve(res);
        });
    });

    // Step 5: Save the details in the DB
    const employeeTemplateData = {
      content: modifiedContent,
      filepath: `${baseUrl}${relativeFilePath}`,
      startDate: contractDetails.startDate,
      employeeId: employeeData._id,
      type: contractDetails.type,
      endDate: contractDetails.endDate,
    };

    const savedTemplate = await saveEmployeeTemplate(employeeTemplateData);

    // Add the new template to the employee's record
    const addToEmployee = await Employee.findOne({ _id: employeeData._id });
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





async function downloadFile(url, outputPath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function pdfToImages(pdfPath) {
  const pdfData = await fs.promises.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfData);
  const imageFiles = [];

  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    // Render the page to canvas (you might need a library for this)
    // const imageData = page.render();
    // context.putImageData(imageData, 0, 0);

    const imageFile = `page-${i + 1}.png`;
    const out = fs.createWriteStream(imageFile);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    await new Promise((resolve, reject) => {
      out.on("finish", () => {
        imageFiles.push(imageFile);
        resolve();
      });
      out.on("error", reject);
    });
  }

  return imageFiles;
}


async function extractTextFromPDF(pdfUrl) {
  try {
    const pdfPath = "./downloads/pdfFile.pdf";
    await downloadFile(pdfUrl, pdfPath);

    // Check if PDF file exists
    if (!fs.existsSync(pdfPath)) {
      console.error("PDF file not found after download.");
      return "";
    }

    const imageFiles = await pdfToImages(pdfPath);
    console.log("Image files:", imageFiles);
    if (imageFiles.length === 0) {
      console.error("No images were created from the PDF.");
      return "";
    }

    const worker = await createWorker();

    

    let fullText = "";

    for (const imagePath of imageFiles) {
      console.log(`Preprocessing ${imagePath}...`);
      const processedImagePath = await preprocessImage(imagePath); // Get the new path
      console.log(`Recognizing text from ${processedImagePath}...`);
      const {
        data: { text },
      } = await worker.recognize(processedImagePath);
      console.log(`Recognized text from ${processedImagePath}:`, text);
      fullText += text + "\n"; // Append recognized text
    }



    console.log("Full Text:", fullText);

    await worker.terminate();
    return fullText; // Return the concatenated text
  } catch (error) {
    throw new Error("Error extracting text from PDF: " + error.message);
  }
}

async function preprocessImage(imagePath) {
  const processedImagePath = imagePath.replace(".png", "-processed.png");
  await sharp(imagePath)
    .resize(1200) // Resize to width of 1200 pixels
    .greyscale() // Convert to grayscale
    .modulate({ brightness: 1.2, contrast: 1.5 }) // Increase brightness and contrast
    .sharpen() // Sharpen the image
    .toFile(processedImagePath); // Save to a new file
  return processedImagePath;
}










function replaceTemplateFields(content, employeeData, contractDetails, mangerDetails) {

  console.log(content);
  let modifiedContent = content;
  modifiedContent = modifiedContent.replace(
    /{{manager_firstname}}/g,
    mangerDetails.firstName
  );
  modifiedContent = modifiedContent.replace(
    /{{manager_lastname}}/g,
    mangerDetails.lastName
  );
  modifiedContent = modifiedContent.replace(
    /{{manger_address}}/g,
    `${mangerDetails.houseNumber}, ${mangerDetails.street} Str,  ${mangerDetails.city}`
  );
  modifiedContent = modifiedContent.replace(
    /{{firstname}}/g,
    employeeData.firstName
  );
  modifiedContent = modifiedContent.replace(
    /{{lastname}}/g,
    employeeData.lastName
  );
  modifiedContent = modifiedContent.replace(
    /{{house_number}}/g,
    employeeData.houseNumber
  );
  modifiedContent = modifiedContent.replace(/{{street}}/g, employeeData.street);
  modifiedContent = modifiedContent.replace(/{{city}}/g, employeeData.city);
  modifiedContent = modifiedContent.replace(
    /{{dob}}/g,
    employeeData.dateOfBirth
  );
  // Replace other fields as necessary

  
  return modifiedContent;
}





async function saveEmployeeTemplate(data) {
  const employeeTemplate = new EmployeeTemplate(data);
  await employeeTemplate.save();
  return employeeTemplate;
}