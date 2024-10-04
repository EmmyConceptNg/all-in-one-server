const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  incomeTaxNumber: { type: String, required: true },
  bankName: { type: String, required: true },
  billingDate: { type: Date, required: true },
  status: { type: String, enum: ["Pending", "Paid", "Cancelled"], required: true },
  amount: { type: Number, required: true },
  vat: { type: Number, required: true }, 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
