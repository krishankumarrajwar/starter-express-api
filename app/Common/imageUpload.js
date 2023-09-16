const multer = require("multer");

// upload image 
module.exports.upload  = multer({
    storage:multer.diskStorage({
       destination:function(req,file,cb){
          cb(null,"images");
       },
       filename:function(req,file,cb){
          cb(null,Date.now()+file.originalname);
       }
    })
  });
// upload image 
//file upload for docs
var SetImage = multer.diskStorage({
   destination: (req, file, cb) => {
       cb(null, 'images/')
   },
   filename: (req, file, cb) => {
       cb(null,Date.now() + file.originalname)
   }
});
module.exports.uploadmultipleimage = multer({ storage: SetImage });