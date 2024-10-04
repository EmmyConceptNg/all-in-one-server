const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accountingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create-invoice', authMiddleware(['super_admin', 'manager']), accountingController.createInvoice);
router.get('/get-invoices', authMiddleware(['super_admin', 'manager']), accountingController.getInvoices);

module.exports = router;
