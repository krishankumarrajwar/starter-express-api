const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    email: { type: String, default: "" },
    phonenumber: { type: String, default: "",unique:true },
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


RetailerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model("retailer", RetailerSchema);
