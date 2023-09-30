const mongoose =  require("mongoose");
const bcrypt = require("bcrypt");

const DistributorSchema = new mongoose.Schema(
  {
    firstname: { type: String, default: "" },
    lastname: { type: String, default: "" },
    phonenumber: { type: String, default: "",unique:true },
    email: { type: String, default: "" },
    pincode: { type: String, default: "" },
    city: { type: String, default: "" },
    area: { type: String, default: "" },
    state: { type: String, default: "" },
    password: { type: String, default: "" },
    distributorcode: { type: String, default: "" },
    distributortype: { type: String, default: "" },
    verify: { type: String, default: false },
    otp: { type: Number, default: 0 },
    gst_number: { type: String },
    gst_file: { type: String },
    drug_licence: { type: String },
    image: { type: String },
    bank_name: String,
    benificiary_name: String,
    account_number: String,
    ifsc_code: String,
  
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
DistributorSchema.pre('save', async function (next) {
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


module.exports = mongoose.model("distributor",DistributorSchema);