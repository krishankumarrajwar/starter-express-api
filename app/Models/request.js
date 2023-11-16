const mongoose = require("mongoose");
const RetailerSchema = new mongoose.Schema(
  {
    product_name: String,
    manufacturer: String,
    product_type: String,
    description: String,
    requested_by: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("product_request", RetailerSchema);
