
const Admin = require('../Models/Admin.js');
const response = require("../Common/common.js");
const jwt = require("jsonwebtoken");
const Order = require('../Models/Order');
const Payout = require('../Models/payout');
const token = require("../Models/token");
const Distributor = require("../Models/Distributor");
const Retailer = require("../Models/Retailer");

//-------------------------------  Admin Login ---
exports.signup = async (req, res) => {
  const { email } = req.body;
  Admin.findOne({ email: email }).then((check) => {
    if (!check || check.length == 0) {
      //new Insert Admin
      const adminData = getAdminData(req);
      response.sendResponse(
        res,
        "success",
        "Your account has been created successfully."
      );
    } else {
      response.sendResponse(
        res,
        "fail",
        "Sorry,Email already exists please choose a different one."
      );
    }
  });
};

//-------------------------------  Admin SIGNUP ---
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    Admin.findOne({ email: email }).then((check) => {
      if (!check || check.length == 0) {
        response.sendResponse(
          res,
          "fail",
          "Sorry,The email address you entered were invalid."
        );
      } else {
        check.comparePassword(password, function (err, isMatch) {
          var token = jwt.sign({ user_id: check._id }, "Secret", {
            expiresIn: "2h",
          });
          if (isMatch === true) {
            return res.send({
              data: check,
              token: token,
              status: true,
              message: "Successfully Login",
            });
            // response.senddataResponse(res,check,true,"Successfully log in");
          } else {
            response.sendResponse(
              res,
              "fail",
              "Sorry, The email address or password you entered were invalid"
            );
          }
        });
      }
    });
  } else {
    return responses.sendResponse(
      res,
      "fail",
      "Sorry json parameter are missing."
    );
  }
};

module.exports.all_order = async (req, res) => {
  await Order.find({ return_status: 0 })
    .sort({ createdAt: -1 })
    .then(async (item) => {
      const mappedResults = await Promise.all(
        item.map(async (e) => {
          let distributerName = await Distributor.findOne({
            _id: e.distributor_id,
          });
          let retailerName = await Retailer.findOne({
            _id: e.retailer_id,
          });
          e._doc.distributor_name =
            distributerName.firstname + " " + distributerName.lastname;
          e._doc.retailer_name = retailerName.ownername;
          return e;
        })
      );
      response.sendResponse(res, "success", mappedResults);
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};

module.exports.order_status_change = async (req, res) => {
  const { order_id, status } = req.body;
  await Order.findOneAndUpdate(
    { _id: order_id },
    { order_status: status },
    { new: true }
  )
    .then((item) => {
      response.sendResponse(res, "success", item);
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};

module.exports.order_detail = async (req, res) => {
  const { order_id } = req.body;
  await Order.findOne({ _id: order_id })
    .then((item) => {
      response.sendResponse(res, "success", item);
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};

module.exports.return_order_request = async (req, res) => {
  res.send("Nothing here");
};
module.exports.return_order_accepted = async (req, res) => {
  await Order.updateOne({ order_id: req.query.order_id }, { return_status: 3 })
    .then((result) => {
      res.send({
        status: true,
        message: "order return get success",
        data: result,
      });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};
module.exports.get_all_return_delivered_order = async (req, res) => {
  await Order.findOne({ return_status: "delivered" })
    .sort({ createdAt: -1 })
    .then((item) => {
      res.send({
        status: true,
        message: "order accepted get success",
        data: item,
      });
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};

module.exports.return_order_deliver = async (req, res) => {
  const { order_id } = req.body;
  await Order.findOneAndUpdate({ _id: order_id }, { return_status: 3 })
    .then((item) => {
      res.send({ status: true, message: "deliver success" });
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};
const payout_transactions = require("../Models/payout_transaction");
module.exports.all_payout_request = async (req, res) => {
  if (req.params.id == "All") {
    var obj = {};
  } else {
    var obj = { payment_status: req.params.id };
  }
  await payout_transactions
    .find(obj)
    .sort({ createdAt: -1 })
    .then((item) => {
      response.sendResponse(res, "success", item);
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};

module.exports.accept_payout = async (req, res) => {
  const { payout_id } = req.body;
  await payout_transactions
    .findOneAndUpdate({ _id: payout_id }, { $set: { payment_status: 1 } })
    .then((result) => {
      console.log(result);
      res.send({ status: true, message: "payout success" });
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};

module.exports.change_order_status = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
};

module.exports.get_return_admin = async (req, res) => {
  try {
    let obj = {};
    if (!req.query.from && !req.query.to) {
      obj = {
        return_status: { $gt: 1 },
      };
    } else {
      obj = {
        return_status: { $gt: 1 },
        createdAt: {
          $gte: req.query.from,
          $lte: req.query.to,
        },
      };
    }
    console.log(obj);
    await Order.find(obj)
      .then(async (item) => {
        const mappedResults = await Promise.all(
          item.map(async (e) => {
            let distributerName = await Distributor.findOne({
              _id: e.distributor_id,
            });
            let retailerName = await Retailer.findOne({
              _id: e.retailer_id,
            });
            e._doc.distributor_name =
              distributerName.firstname + " " + distributerName.lastname;
            e._doc.retailer_name = retailerName.ownername;
            return e;
          })
        );

        res.send({
          status: true,
          message: "data fetched",
          data: mappedResults,
        });
      })
      .catch((err) => {
        console.log(err);
        res.send({ status: false, message: "data fetch failed", data: null });
      });
  } catch (err) {
    console.log(err);
  }
};

const Product = require("../Models/Product");

module.exports.order_details = async (req, res) => {
  try {
    await Order.find({ order_id: req.query.order_id })
      .then(async (result) => {
        let totalAmount = 0;
        let getProductTax;

        result[0].products.map(async (e) => {
          totalAmount += result[0].price * e.quantity ?? 1;
        });
        result = result[0];
        getProductTax = await Product.findOne({ _id: result.products[0].id });
        console.log(getProductTax);
        console.log("this is result", result.products[0].id);
        let distributerName = await Distributor.findOne({
          _id: result.distributor_id,
        });
        let retailerName = await Retailer.findOne({
          _id: result.retailer_id,
        });
        result._doc.distributor_name =
          distributerName.firstname + " " + distributerName.lastname;
        result._doc.distributor_address =
          distributerName.city +
          " " +
          distributerName.area +
          " " +
          distributerName.state;
        result._doc.retailer_name = retailerName.ownername;
        result._doc.retailer_address = retailerName.address;
        result._doc.item_total = totalAmount;
        result._doc.Tax = (totalAmount * getProductTax.applicable_tax) / 100;
        result._doc.delivery_fee = 100;
        result._doc.order_total =
          result._doc.item_total + result._doc.Tax + result._doc.delivery_fee;
        res.send({
          status: true,
          message: "Order Details",
          data: result,
        });
      })
      .catch((err) => {
        res.send({ status: false, message: err });
        console.log(err);
      });
  } catch (err) {
    res.send({ status: false, message: err });
    console.log(err);
  }
};

const Invoice = require("../Models/invoice");
module.exports.get_invoice = async (req, res) => {
  try {
    let order_id = req.query.order_id;
    let findinvoice = await Invoice.find({ order_id: order_id });
    if (!findinvoice || findinvoice.length == 0)
      return res.send({ status: false, message: "No data found" });
    res.send({ status: true, message: "invoice fetched", data: findinvoice });
  } catch (err) {
    console.log(err);
  }
};







//Operation
async function getAdminData(req){
    let request=req.body;  
    const new_admin = new Admin({
        email: request.email,
        password: request.password
    });

    const InsertNew=await new_admin.save();
    return InsertNew;
}