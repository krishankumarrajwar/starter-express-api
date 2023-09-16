const { resolveInclude } = require("ejs");
const { response } = require("express");
const jwt = require("jsonwebtoken")


// generate user token function 
module.exports = function generateUsertoken(id){
    return jwt.sign(
         { user_id: id },
         process.env.JWT_KEY,
         {
           expiresIn: "2h",
         }
       );
 }

// send simple response 
 module.exports.sendResponse = function sendResponse(resp,status,msg){
    return resp.send({status:status,message:msg});
 }


//  send data response  
module.exports.senddataResponse = function senddataResponse(resp,data,status,msg){
  return resp.send({data:data,status:status,message:msg});
}


// upload  single image 
module.exports.uploadsingleImage = function uploadimage(req){

  var image;
//file upload

var upload = multer({
  storage:multer.diskStorage({
     destination:function(req,file,cb){
        cb(null,"images");
     },
     filename:function(req,file,cb){
        cb(null,Date.now()+file.originalname);
     }
  })
});

 return image;

}