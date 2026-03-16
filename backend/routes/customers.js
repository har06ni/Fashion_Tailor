const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Search customers or fetch all
router.get('/', async (req, res) => {
    try {
        const { phone, search } = req.query;
        let query = {};
        if (phone) query.phone = phone;
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                    { customerId: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const customers = await Customer.find(query);
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

module.exports = router;
