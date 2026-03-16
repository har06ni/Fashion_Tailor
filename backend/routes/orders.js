const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { sendSMS } = require('../services/smsService');
const { uploadImage } = require('../services/cloudinaryService');

// Create Order (which also creates/updates Customer)
router.post('/', async (req, res) => {
    try {
        const {
            customer: customerData,
            measurements,
            counts,
            deliveryDate,
            payment
        } = req.body;

        // Process Images (Upload to Cloudinary)
        const processImages = async (section) => {
            if (measurements[section] && measurements[section].images) {
                const uploadedUrls = await Promise.all(
                    measurements[section].images.map(async (img) => {
                        if (img.startsWith('data:image')) {
                            return await uploadImage(img);
                        }
                        return img; // Already a URL or other format
                    })
                );
                measurements[section].images = uploadedUrls;
            }
        };

        await processImages('pants');
        await processImages('shirts');

        // Handle Customer
        const cleanedPhone = customerData.phone.trim().replace(/\s/g, '');
        let customer = await Customer.findOne({ phone: cleanedPhone });

        if (customer) {
            // Update existing customer measurements
            customer.lastMeasurements = measurements;
            await customer.save();
        } else {
            // Create new customer
            const count = await Customer.countDocuments();
            const customerId = `C${101 + count}`;
            customer = new Customer({
                ...customerData,
                customerId,
                lastMeasurements: measurements
            });
            await customer.save();
        }

        // Generate Order ID
        const orderCount = await Order.countDocuments();
        const orderId = `ORD${1001 + orderCount}`;

        const newOrder = new Order({
            orderId,
            customer: customer._id,
            measurements,
            counts,
            deliveryDate,
            payment
        });

        await newOrder.save();

        // Send SMS
        const { skipSMS, customSMS } = req.body;
        if (!skipSMS) {
            const smsContent = customSMS || `Hello! Your order has been successfully registered.

Total Amount: ${payment.totalAmount}
Advance Paid: ${payment.advancePaid}
Balance Amount: ${payment.balanceAmount}
Delivery Date: ${new Date(deliveryDate).toLocaleDateString()}

– Fashion Tailor
MariMuthu
9894142906`;

            console.log(`[ORDER] Sending SMS to ${customer.phone}...`);
            const smsResult = await sendSMS(customer.phone, smsContent);
            console.log('[ORDER] SMS result:', smsResult);
        }

        res.status(201).json(newOrder);
    } catch (err) {
        console.error('CRITICAL ORDER ERROR:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: 'Validation Error', details: err.errors });
        }
        res.status(500).json({ error: 'Failed to create order', message: err.message });
    }
});

// Update Order Status (Stitching -> Ready to Deliver)
router.patch('/:id/status', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customer');
        if (!order) return res.status(404).json({ error: 'Order not found' });

        order.status = req.body.status;
        await order.save();

        const { skipSMS, customSMS } = req.body;
        if (order.status === 'Ready to Deliver' && !skipSMS) {
            const smsContent = customSMS || `Hello! Your stitching order is completed.
You can visit the shop and collect your clothes.

– Fashion Tailor
MariMuthu
9894142906`;
            console.log(`[STATUS UPDATE] Sending SMS to ${order.customer.phone}...`);
            const smsResult = await sendSMS(order.customer.phone, smsContent);
            console.log('[STATUS UPDATE] SMS result:', smsResult);
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Get single order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customer');
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch order', message: err.message });
    }
});

// Send Generic Custom SMS
router.post('/send-custom-sms', async (req, res) => {
    try {
        const { phone, message } = req.body;
        if (!phone || !message) {
            return res.status(400).json({ error: 'Phone and message are required' });
        }
        const result = await sendSMS(phone, message);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to send SMS', message: err.message });
    }
});

// Marking Delivered
router.patch('/:id/deliver', async (req, res) => {
    try {
        const { balancePaidMethod } = req.body;
        const order = await Order.findById(req.params.id).populate('customer');
        if (!order) return res.status(404).json({ error: 'Order not found' });

        order.status = 'Delivered';
        order.payment.balancePaidMethod = balancePaidMethod;
        await order.save();

        const { skipSMS, customSMS } = req.body;
        if (!skipSMS) {
            const smsContent = customSMS || `Hello! Your order has been successfully delivered.

Total Amount: ${order.payment.totalAmount}
Advance Paid: ${order.payment.advancePaid}
Balance Paid: ${order.payment.balanceAmount}

Thank you for choosing us!

– Fashion Tailor
MariMuthu
9894142906`;
            console.log(`[DELIVERY] Sending SMS to ${order.customer.phone}...`);
            const smsResult = await sendSMS(order.customer.phone, smsContent);
            console.log('[DELIVERY] SMS result:', smsResult);
        }

        res.json(order);
    } catch (err) {
        console.error('CRITICAL DELIVER ERROR:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: 'Validation Error', details: err.errors });
        }
        res.status(500).json({ error: 'Failed to deliver order', message: err.message });
    }
});

// Get orders by status
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const orders = await Order.find(filter).populate('customer').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

module.exports = router;
