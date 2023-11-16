const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema(
  {
    token: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("token", tokenSchema);
