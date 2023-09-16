const mongoose = require('mongoose');

var OrderSchema = mongoose.Schema(
  {
    order_id: { type: String, default: "" },
    distributor_id: { type: mongoose.Schema.Types.ObjectId },
    retailer_id: { type: mongoose.Schema.Types.ObjectId },
    price: { type: Number, default: 0 },
    products: { type: Array, default: [] },
    batch_no: { type: String, default: "" },
    exp_date: { type: String, default: "" },
    bonus_quantity: { type: Number, default: 0 },
    order_status: { type: Number, default: 4 },
    return_status: { type: Number, default: 0 },
    return_quantity: { Type: Number, default: 0 },
    return_reason: { type: String, default: "" },
    return_message: { type: String, default: "" },
    return_image: { type: String, default: "" },
    payment_status: { type: Number, default: 4 },
    payment_type: { type: Number, default: 0 },
    time: { type: Number, default: Date.now },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('order', OrderSchema);