const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin', 
    required: true
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace' 
  },
  isManager: { 
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'manager', 'staff'],
    default: 'staff'
  },
  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  address: {
    postalCode: String,
    city: String,
    street: String,
    houseNumber: String
  },
  email: { type: String, required: true },
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
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;