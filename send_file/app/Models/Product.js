const mongoose = require('mongoose');

var ProductSchema = mongoose.Schema(
  {
    title: { type: String, default: "" },
    sub_title: { type: String, default: "" },
    category_id: { type: mongoose.Schema.Types.ObjectId },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    time: { type: Number, default: Date.now },
    productStatus: { type: String, default: true },
    hsn: String,
    applicable_tax: Number,
    distributors: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('product', ProductSchema);