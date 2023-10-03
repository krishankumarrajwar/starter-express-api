const mongoose = require("mongoose");
const RetailerSchema = new mongoose.Schema(
  {
    businesstype: { type: String, default: "" },
    businessname: { type: String, default: "" },
    ownername: { type: String, default: "" },
    address: { type: String, default: "" },
    pincode: { type: String, default: "" },
    city: { type: String, default: "" },
    area: { type: String, default: "" },
    state: { type: String, default: "" },
    phonenumber: { type: String, default: "" },
    password: { type: String, default: "" },
    pharname: { type: String, default: "" },
    pharphone: { type: String, default: "" },
    licenseno: { type: String, default: "" },
    licenseimage: { type: String, default: "" },
    gstno: { type: String, default: "" },
    gstimage: { type: String, default: "" },
    panno: { type: String, default: "" },
    verify: { type: String, default: false },
    otp: { type: Number, default: 0 },
    token: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("retailer", RetailerSchema);
