const mongoose =  require("mongoose");
const DistributorSchema = new mongoose.Schema(
  {
    firstname: { type: String, default: "" },
    lastname: { type: String, default: "" },
    phonenumber: { type: String, default: "" },
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

module.exports = mongoose.model("distributor",DistributorSchema);