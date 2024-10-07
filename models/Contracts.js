const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  managingDirector: { type: String, required: true },
  address: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Contract = mongoose.model('Contract', ContractSchema);

module.exports = Contract;
