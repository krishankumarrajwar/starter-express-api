const Retailer = require("../Models/Retailer");
const banner = require('../Models/Banner.js');
const category = require('../Models/Category.js');
const offer = require('../Models/Offer');
const Distributor = require("../Models/Distributor");
const Product = require('../Models/Product');
const Order = require('../Models/Order');
const Cart = require('../Models/Cart');
const mongodb = require("mongodb");
const generateUsertoken = require("../Common/common.js");
const fs = require("fs");
const e = require("cors");
const token = require("../Models/token");
const sdk = require('api')('@phonepe-docs/v1#3dxznuf1gljiezluv');
const phonePaySalt= "c817ffaf-8471-48b5-a7e2-a27e5b7efbd3"
const phonePaySaltIndex= 1
const base64json = require('base64json');
// const sha256= require('sha256')
const axios = require('axios');
var sha256 = require('js-sha256').sha256;
const nodemailer = require('./nodemailer')


require("dotenv").config();

// login function
module.exports.retailer_login = async (req, resp) => {
  // create jwt token
  console.log(req.body);
  const { phone, password } = req.body;
  await Retailer.findOne({
    phonenumber: phone,
    password: password,
  }).then(async (result) => {
    console.log(result)
    if (result != null) {
      const jwt = generateUsertoken(result);
      let saveToken = new token({ token: jwt });
      await saveToken.save();
      resp.json({
        status: true,
        message: "login successful",
        data: result,
        token: jwt,
      });
    } else {
      resp.json({ status: false, message: "login unsuccessful" });
    }
  });
};

// get user details using token
module.exports.retailer_register = async (req, resp) => {
  await Retailer.findOne({ phonenumber: req.body.phonenumber }).then((user) => {
    if (user != null) {
     return resp.send({ status: false, message: "Retailer already exist" });
    }
  });

  var data = req.body;

  console.log('data',data)

  console.log('req.files',req.files)
  // data.licenseimage = req.files["image1"].location;
  // data.gstimage = req.files["image2"].location;
  const retailer = new Retailer(data);
  const retailer_data = await retailer.save();
  // // console.log(retailer_data);
  resp.send({ status: true, message: "Retailer signup successfull" });
};

// update user details
module.exports.retailer_update = async (req, resp) => {
  console.log(req.body);
  var data = req.body;

  await Retailer.findOneAndUpdate(
    { _id: req.user._id },
    {
      $set: data,

    }
  )
    .then((result) => {
      console.log(result);
      resp.send({ status: true, message: "Retailer Update successfull" });
    })
    .catch((err) => {
      resp.send({ status: false, message: err });
      console.log(err);
    });
};
// delete user details
module.exports.retailer_delete = async (req, resp) => {
  await Retailer.findOneAndDelete({ _id: req.user._id })
    .then((result) => {
      console.log(result);
      resp.send({ status: true, message: "Retailer Delete successfull" });
    })
    .catch((err) => {
      resp.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.retailer_profile = async (req, res) => {
  await Retailer.findOne({ _id: req.user._id })
    .then((result) => {
      console.log(result);
      res.send({
        status: true,
        message: "Retailer get successfull",
        data: result,
      });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.retailer_home = async (req, res) => {
   try {
    var bannerdata;
    var categorydata;
    var productdata = [];
    var offerdata;

    await banner.find().then((data) => {
      bannerdata = data;
    });

    await category.find().then((cat) => {
      categorydata = cat;
    });

    await offer.find().then((data) => {
      offerdata = data;
    });

    var retailer = await Retailer.findOne({ _id: req.user._id });
    var retailercity = retailer.city;
    var distributor = await Distributor.find({ city: retailercity });
     if(!distributor || distributor.length ==0) return res.send({status:false , message : "no distributor found for the city"}) 
    var distributor_id = [];
    distributor.map((id) => {
      distributor_id.push(id._id.toString());
    });

    var pro = await Product.find();
     if(!pro) return res.status({status:false , message : "please add product"})
     console.log(pro)
    pro.map((item) => {
      if (item.distributors != null || item.distributors.length > 0 ) {
        item.distributors.map((dis) => {
          console.log(dis)
          if (distributor_id.includes(dis.distributorId)) {
            var obj = {
              name: item.title,
              distributor_name: dis.distributorName,
              price: dis.price,
            };
            productdata.push(obj);
          }
        });
      }
    });

    res.send({
      status: true,
      message: "Retailer home successful",
      bannerdata,
      categorydata,
      productdata,
      offerdata,
      distributor
    });
  } catch (err) {
    res.send({ status: false, message: err });
    console.log(err);
  }
};

module.exports.category_product = async (req, res) => {
  var productdata = [];
  var retailer = await Retailer.findOne({ _id: req.user._id });
  var retailercity = retailer.city;
  var distributor = await Distributor.find({ city: retailercity });
  var distributor_id = [];
  distributor.map((id) => {
    distributor_id.push(id._id.toString());
  });

  var pro = await Product.find({ category_id: req.body.category_id });
  console.log('pro',pro)
  pro.map((item) => {
    if (item.distributors.length > 0) {
      item.distributors.find((dis) => {
        if (distributor_id.includes(dis.distributorId)) {
          var obj = {
            _id: item._id,
            name: item.title,
            subtitle: item.sub_title,
            price: dis.price,
          };
          productdata.push(obj);
        }
      });
    }
  });

  res.send({
    product: pro,
    status: true,
    message: "Retailer data show successfull",
  });
};

module.exports.get_product = async (req, res) => {
  var productdata = [];
  var retailer = await Retailer.findOne({ _id: req.user._id });
  var retailercity = retailer.city;
  var distributor = await Distributor.find({ city: retailercity });
  var distributor_id = [];
  distributor.map((id) => {
    distributor_id.push(id._id.toString());
  });

var pro = await Product.find({});

pro.map((item) => {
  if (item.distributors.length > 0) {
    var lowestPrice = Infinity; // Initialize with highest possible value
    var lowestPriceDistributor = null;

    item.distributors.forEach((dis) => {
      if (distributor_id.includes(dis.distributorId)) {
        if (dis.price < lowestPrice) {
          lowestPrice = dis.price;
          lowestPriceDistributor = dis.distributorName;
        }
      }
    });

    if (lowestPriceDistributor) {
      var obj = {
        id: item._id,
        name: item.title,
        distributor_name: lowestPriceDistributor,
        price: lowestPrice,
      };
      productdata.push(obj);
    }
  }
});

  res.send({
    product: pro,
    status: true,
    message: "Retailer data show successfull",
  });
};

module.exports.product_details = async (req, res) => {
  try{
    console.log(req.user._id)
    var retailer = await Retailer.findOne({ _id: req.user._id });
    var retailercity = retailer.city;
    var distributor = await Distributor.find({ city: retailercity });
    var distributor_id = [];
    var distributor_data = [];
    distributor.map((id) => {
      distributor_id.push(id._id.toString());
    });
    console.log(distributor_id);
    console.log("Product", req.body);

    var pro = await Product.findOne({ _id: req.body.id });
    console.log('pro',pro)
    if (pro && pro.distributors.length > 0) {
      pro.distributors.map((dis) => {
        if (distributor_id.includes(dis.distributorId)) {
          distributor_data.push(dis);
        }
      });
    }
  
    var product = {
      name: pro?.title,
      subname: pro?.sub_title,
      description: pro?.description,
      price: distributor_data[0]?.price,
      stock: distributor_data[0]?.stock,
      applicable_tax: pro?.applicable_tax,
    };
  
    res.send({
      product: pro,
      distributor: pro.distributors,
      status: true,
      message: "Product data show successfull",
    });
  }catch (err){
    console.log(err)
  }

};

module.exports.add_to_cart = async (req, res) => {
  await Cart.findOne({ user_id: req.user._id }).then(async (cartdata) => {
    if (cartdata != null) {
      if (
        cartdata.distributor_id == req.body.distributor_id &&
        cartdata.product_id == req.body.product_id
      ) {
        return res.send({
          status: true,
          message: "Item already in cart",
        });
      } else if (cartdata.distributor_id != req.body.distributor_id) {
        return res.send({
          status: false,
          message: "You can order one distributor at one time",
        });
      } else {
        var obj = {
          user_id: req.user._id,
          product_id: req.body.product_id,
          distributor_id: req.body.distributor_id,
          quantity: req.body.quantity,
        };

        console.log('obj', obj)
        await Cart.create(obj)
          .then((item) => {
            res.send({
              status: true,
              message: "add to cart successfull",
            });
          })
          .catch((err) => {
            res.send(res, false, err);
          });
      }
    } else {
      var obj = {
        user_id: req.user._id,
        product_id: req.body.product_id,
        distributor_id: req.body.distributor_id,
        quantity: req.body.quantity,
      };

      console.log('obj', obj)

      await Cart.create(obj)
        .then((item) => {
          res.send({
            status: true,
            message: "add to cart successfull",
          });
        })
        .catch((err) => {
          res.send(res, false, err);
        });
    }
  });
};

module.exports.get_cart = async (req, res) => {
  await Cart.find({ user_id: req.user._id })
    .then(async (item) => {
      console.log('item', item)
      var arr = [];
      for (var i = 0; i < item.length; i++) {
        var product = await Product.findOne({ _id: item[i].product_id });
        var dis = product.distributors.filter(
          (pro) => pro.distributorId == item[0].distributor_id
        );
      console.log(dis,"dis");

        var obj = {
          _id: item[i]._id,
          product:product,
          product_id: item[i].product_id,
          product_name: product.title,
          distributor_name: dis[0].distributorName,
          distributor_id: dis[0].distributorId,
          price: dis[0].price,
          quantity: item[i].quantity,
        };
        arr.push(obj);
      }
      console.log(obj);
      res.send({
        status: true,
        data: arr,
        message: "cart data show successfull",
      });
    })
    .catch((err) => {
      res.send({
        status: false,
        message: err,
      });
    });
};

module.exports.update_cart = async (req, res) => {
  await Cart.findOneAndUpdate(
    { _id: req.body.cart_id },
    {
      quantity: req.body.quantity,
    }
  )
    .then((result) => {
      res.send({
        status: true,
        message: "cart data update successfull",
      });
    })
    .catch((err) => {
      res.send({
        status: false,
        message: err,
      });
    });
};

module.exports.delete_cart = async (req, res) => {
  await Cart.findOneAndDelete({ _id: req.body.cart_id })
    .then((result) => {
      res.send({
        status: true,
        message: "cart data delete successfull",
      });
    })
    .catch((err) => {
      res.send({
        status: false,
        message: err,
      });
    });
};

module.exports.retailer_list = async (req, res) => {
  await Retailer.find(
    { verify: true },
    { businessname: 1, ownername: 1, city: 1, area: 1, phonenumber: 1 }
  )
    .then((result) => {
      res.send({ status: true, message: "Retailer List", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.retailer_request = async (req, res) => {
  await Retailer.find(
    { verify: false },
    { businessname: 1, ownername: 1, city: 1, area: 1, phonenumber: 1 }
  )
    .then((result) => {
      res.send({ status: true, message: "Retailer List", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.retailer_approve = async (req, res) => {
  await Retailer.findOneAndUpdate(
    { _id: req.body.id },
    { verify: true },
    { new: true }
  )
    .then((result) => {
      res.send({ status: true, message: "Retailer Approved", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.retailer_detail = async (req, res) => {
  await Retailer.findOne({ _id: req.body.id })
    .then((result) => {
      res.send({ status: true, message: "Retailer Detail", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.checkout = async (req, res) => {
  try {
    let item = [];
    let distributorId;
    console.log("reqdata==========>", req.body);
    
    await Cart.find({ user_id: req.user._id }).then(async (cartdata) => {
      var len = cartdata.length;

      distributorId = cartdata[0].distributor_id;
      for (var i = 0; i < len; i++) {
        var product = await Product.findOne({ _id: cartdata[i].product_id });
        console.log("product", cartdata[0].quantity);
        product.distributors.forEach(async (e) => {
          if (e.distributorId == distributorId) {
            console.log(e);
            if (!parseInt(e.stock) > parseInt(cartdata[0].quantity)) {
              throw new Error("Not enough stock");
            }
          }
        });
        var price = product.distributors.filter(
          (pro) => pro.distributorId == cartdata[0].distributor_id
        );
        console.log(cartdata[0]);

        var obje = {
          id: product._id,
          name: product.title,
          image: product.image,
          price: price[0].price,
          batch_no: "",
          exp_date: "",
          quantity: cartdata[0].quantity,
        };
        item.push(obje);
      }
      await product.save();
    });
    var orderidData ="MEDI" + (Math.floor(Math.random() * (99999 - 11111)) + 11111);
    console.log(orderidData);
    var obj = {
      retailer_id: req.user._id,
      order_id: orderidData,
      distributor_id: distributorId,
      price: req.body.data.price,
      products: item,
      payment_type: req.body.data.payment_type,
      bonus_quantity: req.body.data.bonus_quantity,
      originalPrice: req.body.data.originalPrice,
      tax: req.body.data.tax, 
       deliveryCost: req.body.data.deliveryCost,

    };

    console.log('obj', obj, "price", req.body.data.price)
    await Order.create(obj)
      .then((item) => {
        console.log('added ed order', item)
        res.send({ status: true, message: "order success", data: item });
      })
      .catch((err) => {
        console.log('added ed err', err)

        res.send({ status: true, message: err.message, data: null });
      });
  } catch (err) {
    res.send({ status: true, message: err.message, data: null });
  }
};

module.exports.my_order = async (req, res) => {
  await Order.find({ retailer_id: req.user._id })
    .sort({ createdAt: -1 })
    .then((result) => {
      res.send({ status: true, message: "My Order", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.return_order = async (req, res) => {
  console.log("called");
  var id = req.body.order_id;
  var status = "returned";
  var files =''
  if(req.files){
    files=req.file.location
  }
  await Order.updateOne(
    { order_id: id, order_status: 3 },
    {
      order_id: "RETURN" + id,
      return_quantity: req.body.quantity,
      return_status: 1,
      return_reason: req.body.reason,
      return_message: req.body.message,
      return_image: files,
    }
  )
    .then((result) => {
      if (result.modifiedCount > 0) {
        return res.send({
          status: true,
          message: "order return success",
          data: result,
        });
      }
      res.send({
        status: false,
        message: "order already complete or not found",
        data: null,
      });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

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
        result.distributor_name =
          distributerName.firstname + " " + distributerName.lastname;
        result.distributor_address =
          distributerName.city +
          " " +
          distributerName.area +
          " " +
          distributerName.state;
        result.retailer_name = retailerName.ownername;
        result.retailer_address = retailerName.address;
        result.item_total = totalAmount;
        result.Tax = (totalAmount * getProductTax.applicable_tax) / 100;
        result.applicable_tax = getProductTax.applicable_tax;

        result.delivery_fee = 100;
        result.order_total =
          result.item_total + result.Tax + result.delivery_fee;

          console.log(result)
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

module.exports.logout = async (req, res) => {
  try {
    const auth_token = req.headers["token"];
    let checkExist = await token.deleteOne({ token: auth_token });
    res.json({
      status: true,
      message: "logout successful",
      data: null,
      token: "",
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: true,
      message: "logout failed",
      data: null,
      token: "",
    });
  }
};

module.exports.get_return = async (req, res) => {
  try {
    let obj = {};
    if (!req.query.from && !req.query.to) {
      obj = {
        return_status: { $gt: 0 },
        $or: [{ distributor_id: req.user._id }, { retailer_id: req.user._id }],
      };
    } else {
      obj = {
        return_status: { $gt: 0 },
        $or: [{ distributor_id: req.user._id }, { retailer_id: req.user._id }],
        createdAt: {
          $gte: req.query.from,
          $lte: req.query.to,
        },
      };
    }

    console.log(obj)
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
        res.send({
          status: false,
          message: "data fetch failed",
          data: null,
        });
      });
  } catch (err) {
    console.log(err);
  }
};
module.exports.retailer_search = async (req, res) => {
  try {
    let keyword = req.query.value; // Replace "keyword" with your desired search term
    let field_name = req.query.field_name;
    let regexPattern = new RegExp(keyword, "i"); // "i" flag for case-insensitive search
    let obj = {
      [field_name]: regexPattern,
    };

    await Retailer.find(obj)
      .then((item) => {
        res.send({ status: true, message: "data fetched", product: item });
      })
      .catch((err) => {
        res.send({
          status: false,
          message: "data fetch failed",
          product: null,
        });
      });
  } catch (err) {
    console.log(err);
  }
};

module.exports.cancel_order_retailer = async (req, res) => {
  try {
    let get_order = await Order.findOne({
      order_id: req.query.order_id,
      order_status: 4,
    });
    if (get_order) {
      get_order.order_status = 0;
      await get_order.save();

      return res.send({ status: true, message: "order cancelled" });
    }
    res.send({ status: true, message: "cannot cancel" });
  } catch (err) {
    console.log(err);
    res.send({ Status: false, message: err.message });
  }
};
module.exports.cancel_order_admin = async (req, res) => {
  try {
    let get_order = await Order.findOne({
      order_id: req.query.order_id,
      order_status: { $gt: 0 },
    });
    if (get_order) {
      get_order.order_status = 0;
      await get_order.save();
      return res.send({ status: true, message: "order cancelled" });
    }
    res.send({ status: true, message: "cannot cancel or not found" });
  } catch (err) {
    console.log(err);
    res.send({ Status: false, message: err.message });
  }
};


module.exports.paymentInitiated = async (req, res) => {
  try {
    var JSONDataPayload = {
      
  "merchantId": "MERCHANTUAT",
  "merchantTransactionId": "MT"+ Math.floor(new Date()),
  "merchantUserId": "MUID123",
  "amount": req.body.paymentPayload.price*100,
  "redirectUrl": "https://meddaily.in/#/home",
  "redirectMode": "REDIRECT",
  "callbackUrl": "http://localhost:8000/calback",
  "mobileNumber": "9999999999",
  "paymentInstrument": {
    "type": "PAY_PAGE"
  }
}
    
    let encoded = base64json.stringify(JSONDataPayload, null, 2);
    var data = `${encoded}/pg/v1/pay`+'099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'

    var sh = sha256(data);

    var fnal = `${sh}###1`

    console.log('body',  req.body)
    console.log('data',  data)
    console.log('encode',  encoded)
    console.log('fnal',  fnal)
    var newS = {
      "body":req.body,
      "data":data,
      "encode":encoded,
      "fnal":fnal
    }


    const options = {
      method: 'POST',
      url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': fnal
      },
      data: {
        request: encoded
      }
    };
    axios
    .request(options)
    .then(function (response) {
      console.log(response.data);

      res.send({...response.data, "newS": newS})
    })
    .catch(function (error) {
      res.send({"newS": newS})
      console.error(error);
    });


  } catch (err) {
    console.log(err);
    res.send({ Status: false, message: err.message });
  }
};

module.exports.paymentCallback = async (req, res) => {
  console.log('callback')
  return
  try {
    var JSONDataPayload = {
      
  "merchantId": "MERCHANTUAT",
  "merchantTransactionId": "MT"+ Math.floor(new Date()),
  "merchantUserId": "MUID123",
  "amount": req.body.paymentPayload.price*100,
  "redirectUrl": "https://webhook.site/redirect-url",
  "redirectMode": "REDIRECT",
  "callbackUrl": "http://localhost:8000/calback",
  "mobileNumber": "9999999999",
  "paymentInstrument": {
    "type": "PAY_PAGE"
  }
}
    
    let encoded = base64json.stringify(JSONDataPayload, null, 2);
    var data = `${encoded}/pg/v1/pay`+'099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'

    var sh = sha256(data);

    var fnal = `${sh}###1`

    console.log('body',  req.body)
    console.log('data',  data)
    console.log('encode',  encoded)
    console.log('fnal',  fnal)
    var newS = {
      "body":req.body,
      "data":data,
      "encode":encoded,
      "fnal":fnal
    }


    const options = {
      method: 'POST',
      url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': fnal
      },
      data: {
        request: encoded
      }
    };
    axios
    .request(options)
    .then(function (response) {
      console.log(response.data);

      res.send({...response.data, "newS": newS})
    })
    .catch(function (error) {
      res.send({"newS": newS})
      console.error(error);
    });


  } catch (err) {
    console.log(err);
    res.send({ Status: false, message: err.message });
  }
};

module.exports.forGotPassword = async  (req,res,next)=>{


  var user = await Retailer.findOne({email:req.body.email})

  

   if(user){
    var val = Math.floor(1000 + Math.random() * 9000);

    nodemailer.sendEmail({
      from:"admin@meddaily.in",
      to:req.body.email,
      subject:"OTP Verification",
      text:"Hi your one time password is "+ val
     })

    res.send({status: true, otp: val})
   }else{
    res.send({
      status: false, message: "user is not valid, please enter valid email"
    })
   }
   

   








}

module.exports.updatePassword = async  (req,res,next)=>{


  var user = await Retailer.findOne({email:req.body.email})

  

   if(user){
  
    var UpdateUser = await Retailer.findOneAndUpdate({email:req.body.email}, {$set:{password:req.body.password}})

    res.send({status: true, message:"Password updated successfully"})
   }else{
    res.send({
      status: false, message: "user is not valid, please enter valid email"
    })
   }


}



// <<<<<<------------------------------Mongo services ------------------------------------------->>>









