const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  managingDirector: String,
  address: {
    postalCode: String,
    city: String,
    street: String,
    houseNumber: String
  },
  contractType: { type: String, enum: ["fulltime", "parttime"], required: true },
  contractStatus: { type: String, enum: ["active", "terminated"], default: "active" },
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  employeeDetails: {
    firstName: String,
    middleName: String,
    lastName: String,
    address: {
      postalCode: String,
      city: String,
      street: String,
      houseNumber: String
    },
    email: String,
    ssn: String,
    healthInsurance: String,
    tin: String,
    nationality: String,
    taxClass: String,
    dateOfBirth: Date,
    countryOfBirth: String,
    placeOfBirth: String,
    maritalStatus: String,
    gender: String,
    disabled: Boolean,
    children: Boolean,
    childAllowance: Number,
    religion: String,
    IBAN: String,
    BIC: String,
    entryDate: Date,
    jobType: String,
    anotherJob: Boolean,
    partTimeJob: Boolean,
    workingHoursPerWeek: Number,
    workingHoursPerMonth: Number,
    annualVacationDays: Number
  }
});

const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;