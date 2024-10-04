const Invoice = require('../models/Invoice');
const generateInvoiceNumber = () => {
  return 'INV-' + Date.now();
};
exports.createInvoice = async (req, res) => {
  const { incomeTaxNumber, bankName, billingDate, status, amount, vat } = req.body;

  try {
    const newInvoice = new Invoice({
      invoiceNumber: generateInvoiceNumber(),
      incomeTaxNumber,
      bankName,
      billingDate,
      status,
      amount,
      vat,
      createdBy: req.userId 
    });

    await newInvoice.save();
    res.status(201).json({ message: "Invoice created successfully", invoice: newInvoice });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    let invoices;

    if (req.userRole === 'super_admin') {
      invoices = await Invoice.find().populate('createdBy', 'name role');
    } else if (req.userRole === 'manager') {
      invoices = await Invoice.find({ createdBy: req.userId }).populate('createdBy', 'name role');
    } else {
      return res.status(403).json({ message: "You do not have the required permissions to view invoices." });
    }

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Server error" });
  }
};

