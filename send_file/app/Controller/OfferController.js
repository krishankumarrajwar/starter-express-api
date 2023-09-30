const offer = require('../Models/Offer');
const response = require("../Common/common.js");
const mongodb = require("mongodb");
const fs = require("fs")
const multer = require("multer");

var upload = multer({
  storage:multer.diskStorage({
     destination:function(req,file,cb){
      console.log(req.files);
        cb(null,"images/");
     },
     filename:function(req,file,cb){
        cb(null,Date.now()+file.originalname);
     }
  })
});


// insert banner with admin panel
module.exports.addoffer = async (req, resp) => {
  let chcekExist = await offer.findOne({
    product_id: req.body.product_id,
    distributor_id: req.body.distributor_id,
  });
  if (!chcekExist) {
    var obj = {
      name: req.body.name,
      product_name: req.body.product_name,
      product_id: req.body.product_id,
      distributor_id: req.body.distributor_id,
      image: req.file.location,
      type: req.body.type,
      value: req.body.type,
      activation_value: req.body.activation_value,
      bonus_quantity: req.body.bonus_quantity,
    };
    offer
      .create(obj)
      .then((item) => {
        response.senddataResponse(resp, true, item, "offer create successfull");
      })
      .catch((err) => {
        response.sendResponse(resp, false, err);
      });
  } else {
    response.senddataResponse(resp, false, null, "offer already exist");
  }
};

// get banner for admin
module.exports.getoffer = async (req, resp) => {
  let obj;
  console.log(req.query);
  if (req.query.distributor_id && req.query.product_id) {
    obj = {
      distributor_id: req.query.distributor_id,
      product_id: req.query.product_id,
    };
  } else {
    obj = {};
  }
  offer
    .find(obj)
    .then((data) => {
      if (!data || data.length == 0) {
        response.sendResponse(resp, false, "Sorry, offer not found.");
      }
      response.senddataResponse(resp, data, true, "offer show Successfully.");
    })
    .catch((err) => {
      response.sendResponse(resp, false, err);
    });
};

// edit banner  show data in panel
module.exports.editoffer = async (req, resp) => {
  const data = await offer.find({ _id: req.params.id });
  if (!data || data.length == 0) {
    response.sendResponse(resp, false, "Sorry, offer not found.");
  }

  response.senddataResponse(resp, data, true, "offer show  Successfully.");
};

// update banner using panel
module.exports.updateoffer = async (req, resp) => {
  var obj;
  if (req.file) {
    var obj = {
      name: req.body.name,
      image: req.file.location,
      type: req.body.type,
    };
  } else {
    var obj = { name: req.body.name };
  }

  offer
    .updateOne(
      {
        _id: new mongodb.ObjectId(req.body.id),
      },
      {
        $set: obj,
      }
    )
    .then((data) => {
      if (data["acknowledged"] == true) {
        resp.send({
          status: true,
          message: "offer update successfully",
          data: data,
        });
      }
    })
    .catch((err) => {
      response.sendResponse(resp, false, err);
    });
};

  
  // delete banner
  module.exports.deleteoffer = async (req,resp)=>{

     // image delete 
     const olddata = await offer.findOne({_id:req.params.id});
     // resp.send({data:olddata.image});
     if(olddata != null){
       if (fs.existsSync("./images/"+olddata.image)) {
         fs.unlinkSync("./images/"+olddata.image);
       }
 
     const data = await offer.deleteOne( 
        {
            _id:new mongodb.ObjectId(req.params.id)
        });
        if(data['acknowledged'] == true){
          response.sendResponse(resp,true,"offer delete success");
        }else{
         response.sendResponse(resp,false,"some error found");
        }
 }
 else{
   response.sendResponse(resp,false,"banner not found")
 }
}

  




  // <<<<<--------------------------- mongo services -------------------------->>>>>>>>>>>>>>>>>>>>>>>>>

 
 