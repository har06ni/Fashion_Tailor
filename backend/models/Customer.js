const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  age: { type: Number },
  email: { type: String },
  orderRegisterDate: { type: Date, default: Date.now },
  lastMeasurements: {
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
      sleeve: String, // Full, Half
      fit: String, // Arrow, Slack
      pockets: [String] // P1, P2, SSP1, SSP2, etc.
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
