const mongoose = require("mongoose");

var PayoutSchema = mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    distributor_id: { type: mongoose.Schema.Types.ObjectId },
    payment_status: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("payout_transactions", PayoutSchema);
