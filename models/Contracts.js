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
  contractType: { type: String, enum: ['fulltime', 'parttime'], required: true },
  contractStatus: { type: String, enum: ['active', 'terminated'], default: 'active' },
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;