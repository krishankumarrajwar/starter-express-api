const mongoose = require("mongoose");

var invoiceSchema = mongoose.Schema(
  {
    order_id: String,
    summary: String,
    invoice: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("invoice", invoiceSchema);
