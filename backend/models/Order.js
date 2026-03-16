const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    measurements: {
        pants: {
            m1: String, m2: String, m3: String,
            m4: String, m5: String, m6: String,
            m7: String, m8: String, m9: String,
            m10: String, m11: String,
            comments: String,
            images: [String]
        },
        shirts: {
            m1: String, m2: String, m3: String, m4: String, m5: String,
            m6: String, m7: String, m8: String, m9: String, m10: String,
            m11: String, m12: String, m13: String, m14: String, m15: String,
            comments: String,
            images: [String]
        },
        options: {
            sleeve: { type: String, enum: ['Full Sleeve', 'Half Sleeve'] },
            fit: { type: String, enum: ['Arrow', 'Slack'] },
            pockets: [String]
        }
    },
    counts: {
        pantsCount: { type: Number, default: 0 },
        shirtsCount: { type: Number, default: 0 },
        fullSleeveCount: { type: Number, default: 0 },
        halfSleeveCount: { type: Number, default: 0 }
    },
    deliveryDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Stitching', 'Ready to Deliver', 'Delivered'],
        default: 'Stitching'
    },
    payment: {
        totalAmount: { type: Number, required: true },
        advancePaid: { type: Number, default: 0 },
        balanceAmount: { type: Number, required: true },
        method: { type: String, enum: ['Cash', 'UPI', 'Card'] },
        balancePaidMethod: { type: String, enum: ['Cash', 'UPI', 'Card'] }
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
