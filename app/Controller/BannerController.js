const banner = require('../Models/Banner.js');
const response = require("../Common/common.js");
const mongodb = require("mongodb");
const fs = require("fs")
const multer = require("multer");

var upload = multer({
  storage:multer.diskStorage({
     destination:function(req,file,cb){
      console.log(req.file);
        cb(null,"images/");
     },
     filename:function(req,file,cb){
        cb(null,Date.now()+file.originalname);
     }
  })
});
var img;
var update = multer({
  storage:multer.diskStorage({
     destination:function(req,file,cb){
      console.log(req.file);
        cb(null,"images/");
     },
     filename:function(req,file,cb){
      img = Date.now()+file.originalname;
        cb(null,Date.now()+file.originalname);
     }
  })
});


// insert banner with admin panel
module.exports.addbanner = (req, resp) => {
  var obj = {
    name: req.body.name,
    image: req.file.location,
  };
  console.log(obj);
  banner
    .create(obj)
    .then((item) => {
      response.senddataResponse(resp, true, item, "banner create successfull");
    })
    .catch((err) => {
      response.sendResponse(resp, false, err);
    });
};

// get banner for admin
module.exports.getbanner = async (req, resp) => {

      banner.find().then(data =>{ 
          if (!data || data.length == 0) {
            response.sendResponse(resp,false,"Sorry, banner not found.");
          }
          response.senddataResponse(resp,data,false,"banner show Successfully.");
      }).catch(err => {
        response.sendResponse(resp,false, err);
      });
    
    
  }


  


  // edit banner  show data in panel 
  module.exports.editbanner = async (req, resp) => {

   const data = await banner.find({_id:req.params.id}); 
        if (!data || data.length == 0) {
         response.sendResponse(resp,false, "Sorry, banner not found.");
        }
  
        response.senddataResponse(resp,data,true, "banner show  Successfully.");
   
  }


  // update banner using panel 
  module.exports.updatebanner = async (req, resp) => {
    update.single('image')(req,resp, function (error) {
      var obj;
      if(req.file){
      
        var obj = {name : req.body.name,image : req.file.filename}
      }
      else{
        var obj = {name : req.body.name}
      }
      console.log(img)

      banner.updateOne(
        {
            _id:new mongodb.ObjectId(req.body.id)
        },
        {
            $set:obj
        }).then(data=>{
          if(data['acknowledged'] == true ){
            resp.send({status:true,message:"item update successfully"});
        }
        }).catch(err=>{
          response.sendResponse(resp,false,err);
        })

   
    
  });
  
  };

  
  // delete banner
  module.exports.deletebanner = async (req,resp)=>{

     // image delete 
     const olddata = await banner.findOne({_id:req.params.id});
     // resp.send({data:olddata.image});
     if(olddata != null){
       if (fs.existsSync("./images/"+olddata.image)) {
         fs.unlinkSync("./images/"+olddata.image);
       }
 
     const data = await banner.deleteOne( 
        {
            _id:new mongodb.ObjectId(req.params.id)
        });
        if(data['acknowledged'] == true){
          response.sendResponse(resp,true,"banner delete success");
        }else{
         response.sendResponse(resp,false,"some error found");
        }
 }
 else{
   response.sendResponse(resp,false,"banner not found")
 }
}

  




  // <<<<<--------------------------- mongo services -------------------------->>>>>>>>>>>>>>>>>>>>>>>>>

 
 