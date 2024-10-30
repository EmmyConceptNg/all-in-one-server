const mongoose = require("mongoose");

const EmployeeTemplateSchema = new mongoose.Schema({
  content: String,
  filepath: String,
  startDate: Date,
  employeeId: mongoose.Schema.Types.ObjectId,
  type: String,
  endDate: String,
});

const EmployeeTemplate = mongoose.model(
  "EmployeeTemplate",
  EmployeeTemplateSchema
);


module.exports = EmployeeTemplate;