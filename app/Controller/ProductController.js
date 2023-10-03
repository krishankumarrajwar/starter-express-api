const Product = require('../Models/Product');
const response = require("../Common/common.js");
const category = require("../Models/Category");
const mongodb = require("mongodb");
const fs = require("fs");
const multer = require("multer");
const Product_req = require("../Models/request");

var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      //   console.log(req.files);
      cb(null, "images/");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
  }),
});

// insert banner with admin panel
module.exports.addProduct = (req, resp) => {
  //   upload.single('image')(req, resp, function (err) {
  console.log(req.file);
  var obj = {
    title: req.body.title,
    sub_title: req.body.sub_title,
    category_id: req.body.category_id,
    description: req.body.description,
    hsn: req.body.hsn,
    applicable_tax: req.body.applicable_tax,
  };
  Product.create(obj)
    .then((item) => {
      response.senddataResponse(resp, true, item, "Product create successfull");
    })
    .catch((err) => {
      response.sendResponse(resp, false, err);
    });

  // });
};

// get banner for admin
module.exports.getproduct = async (req, resp) => {
  Product.find()
    .then((data) => {
      console.log(data)
      if (!data || data.length == 0) {
        response.sendResponse(resp, false, "Sorry, Product not found.");
      }
      response.senddataResponse(
        resp,
        data,
        false,
        "Product show Successfully."
      );
    })
    .catch((err) => {
      response.sendResponse(resp, false, err);
    });
};

// edit banner  show data in panel
module.exports.editproduct = async (req, resp) => {
  const data = await Product.find({ _id: req.params.id });
  if (!data || data.length == 0) {
    response.sendResponse(resp, false, "Sorry, Product not found.");
  }

  response.senddataResponse(resp, data, true, "Product show  Successfully.");
};

// update banner using panel
module.exports.updateproduct = async (req, resp) => {
  var obj = {
    title: req.body.title,
    sub_title: req.body.sub_title,
    category_id: req.body.category_id,
    description: req.body.description,
  };

  Product.updateOne(
    {
      _id: new mongodb.ObjectId(req.body.id),
    },
    {
      $set: obj,
    }
  )
    .then((data) => {
      if (data["acknowledged"] == true) {
        resp.send({ status: true, message: "item update successfully" });
      }
    })
    .catch((err) => {
      response.sendResponse(resp, false, err);
    });
};

module.exports.product_details = async (req, res) => {
  var retailer = await Retailer.findOne({ _id: req.user._id });
  var retailercity = retailer.city;
  var distributor = await Distributor.find({ city: retailercity });
  var distributor_id = [];
  var distributor_data = [];
  distributor.map((id) => {
    distributor_id.push(id._id.toString());
  });
  console.log(distributor_id);
  var pro = await Product.findOne({ _id: req.body.id });
  if (pro.distributors.length > 0) {
    pro.distributors.map((dis) => {
      if (distributor_id.includes(dis.distributorId)) {
        distributor_data.push(dis);
      }
    });
  }

  var product = {
    name: pro.title,
    subname: pro.sub_title,
    description: pro.description,
  };

  res.send({
    product: product,
    distributor: distributor_data,
    status: true,
    message: "Product data show successfull",
  });
};

// delete banner
module.exports.deleteproduct = async (req, resp) => {
  // image delete
  const olddata = await Product.findOne({ _id: req.params.id });
  // resp.send({data:olddata.image});
  if (olddata != null) {
    const data = await Product.deleteOne({
      _id: new mongodb.ObjectId(req.params.id),
    });
    if (data["acknowledged"] == true) {
      response.sendResponse(resp, true, "Product delete success");
    } else {
      response.sendResponse(resp, false, "some error found");
    }
  } else {
    response.sendResponse(resp, false, "Product not found");
  }
};

module.exports.update_inventory = async (req, res) => {
  let status, message;
  console.log("THiIS ==================>", req.body);
  const { productId, distributorId, distributorName, price, stock } = req.body;
  const old_des = await Product.findOne({ _id: productId });
  console.log(old_des);
  let flag = 0;
  let ID;
  if (old_des) {
    for (const item of old_des.distributors) {
      if (item.distributorId == distributorId) {
        flag++;
        ID = distributorId;
      }
    }

    if (flag > 0) {
      try {
        const product = await Product.findOneAndUpdate(
          {
            _id: old_des._id,
            "distributors.distributorId": ID,
          },
          {
            $set: {
              "distributors.$.price": parseInt(price),
              "distributors.$.stock": parseInt(stock),
            },
          },
          { new: true }
        );

        if (product) {
          console.log("Product updated successfully.");
          return res
            .status(200)
            .send({ status: true, message: "inventory updated" });
        } else {
          console.log("No matching product or distributor found.");
          return res.status(404).send("Product or distributor not found");
        }
      } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).send("Internal Server Error");
      }
    }
  }
  const filter = { productId: productId };
  const newDistributor = {
    distributorId: distributorId,
    distributorName: distributorName,
    updatedAt: Date.now(),
    price: parseInt(price),
    stock: parseInt(stock),
  };
  old_des.distributors.push(newDistributor);
  // `doc` is the document _before_ `update` was applied
  let doc = await Product.findOneAndUpdate(
    { _id: productId },
    {
      $set: {
        distributors: old_des.distributors,
      },
    },
    {
      new: true,
    }
  );
  if (doc === null) {
    status = false;
    message = "Data does not exit";
  } else {
    status = true;
    message = "Successfully updated";
  }

  res.status(200).send({ status: status, data: doc, message: message });
};

const XLSX = require("xlsx");
const { mkdtemp } = require("fs").promises;
const { join } = require("path");
const Category = require("../Models/Category");
const Distributor = require("../Models/Distributor");
const { setUncaughtExceptionCaptureCallback } = require("process");
module.exports.bulk_upload = async (req, res) => {
  try {
    filePath = req.file.path;
    console.log(req.file);

    // Load the workbook from the file
    const workbook = XLSX.readFile(filePath);

    // Choose the worksheet you want to read (e.g., the first sheet)
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];

    // Convert the worksheet to JSON format
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    let findCategory = await category.findOne({ name: req.body.category });
    console.log(findCategory);
    let promiseArray = jsonData.map(async (e) => {
      e.category_id = findCategory._id;
      await addData(e);
    });
    await Promise.all(promiseArray);
    res.send({ status: true, message: "bulk upload successful" });
  } catch (err) {
    console.log(err);
    res.send({ status: false, message: "bulk upload failed" });
  }
};

let addData = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let insert = new Product(data);
      await insert.save();
      resolve("Saved");
    } catch (err) {
      console.log(err);
      reject("something went wrong");
    }
  });
};

module.exports.searchProduct = async (req, res) => {
  try {
    let getproducts = await getCategoryWiseProducts(req.query.category);

    res.send({
      status: true,
      message: "data fetched successfully",
      data: getproducts,
    });
  } catch (err) {
    console.log(err);
    res.send({ status: false, message: "product search failes" });
  }
};

const getCategoryWiseProducts = async (categoryName) => {
  try {
    const aggregationPipeline = [];

    // Match stage: Filter products based on the category name
    if (categoryName) {
      aggregationPipeline.push({
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      });

      aggregationPipeline.push({ $unwind: "$category" });

      aggregationPipeline.push({
        $match: { "category.name": categoryName },
      });
    } else {
      aggregationPipeline.push({
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      });

      aggregationPipeline.push({
        $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
      });
    }

    // Project stage: Include necessary fields and category name
    aggregationPipeline.push({
      $project: {
        _id: 1,
        title: 1,
        sub_title: 1,
        categoryName: { $ifNull: ["$category.name", "Uncategorized"] },
      },
    });

    // Execute the aggregation pipeline
    const result = await Product.aggregate(aggregationPipeline);
    return result;
    console.log(result);
  } catch (error) {
    console.error("Error executing aggregation query:", error);
  }
};

module.exports.request_product = async (req, res) => {
  try {
    let data = req.body;
    data.requested_by = req.user._id;
    let insert = new Product_req(data);
    await insert.save();
    res.send({ status: true, message: "request submitted" });
  } catch (err) {
    console.log(err);
    res.send({ status: false, message: "request failed" });
  }
};
module.exports.get_request_product = async (req, res) => {
  try {
    let data = await Product_req.find();
    res.send({ status: true, message: "request submitted", data: data });
  } catch (err) {
    console.log(err);
    res.send({ status: false, message: "request failed" });
  }
};



  // <<<<<--------------------------- mongo services -------------------------->>>>>>>>>>>>>>>>>>>>>>>>>

 
 