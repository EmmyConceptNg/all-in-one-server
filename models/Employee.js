const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  postalCode: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String, required: true },
  houseNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  ssn: { type: String, required: true }, 
  healthInsurance: { type: String, required: true },
  tin: { type: String, required: true }, 
  nationality: { type: String, required: true },
  taxClass: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  countryOfBirth: { type: String, required: true },
  placeOfBirth: { type: String, required: true },
  maritalStatus: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  isDisabled: { type: Boolean, required: true },
  hasChildren: { type: Boolean, required: true },
  childAllowance: { type: Number, default: 0 },
  religion: { type: String },
  IBAN: { type: String, required: true },
  BIC: { type: String, required: true },
  entryDate: { type: Date, required: true },
  jobType: { type: String, required: true },
  hasAnotherJob: { type: Boolean, required: true },
  isPartTime: { type: Boolean },
  workingHoursPerWeek: { type: Number, required: true },
  workingHoursPerMonth: { type: Number, required: true },
  annualVacationDays: { type: Number, required: true },
});

const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = Employee;
