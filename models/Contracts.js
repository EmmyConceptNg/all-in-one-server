const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  managingDirector: String,
  address: {
    postalCode: String,
    city: String,
    street: String,
    houseNumber: String
  }
});

const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;