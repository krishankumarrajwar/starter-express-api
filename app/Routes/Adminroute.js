const Retailer = require("../Models/Retailer.js");

module.exports = (admin) => {
  const CategoryController = require("../Controller/CategoryController.js");
  const BannerController = require("../Controller/BannerController.js");
  const OfferController = require("../Controller/OfferController.js");
  const AdminController = require("../Controller/AdminController.js");
  const ProductController = require("../Controller/ProductController.js");
  const DistributorController = require("../Controller/DistributorController.js");
  const RetailerController = require("../Controller/RetailerController.js");
  const upload = require("../Middleware/upload");

  admin.post("/signup", AdminController.signup);
  admin.post("/login", AdminController.login);

  //category
  admin.get("/getcategory", CategoryController.getcategory);
  admin.post("/addcategory", upload.uploadToS3, CategoryController.addcategory);
  admin.get("/editcategory/:id", CategoryController.editcategory);
  admin.post("/updatecategory", CategoryController.updatecategory);
  admin.delete("/deletecategory/:id", CategoryController.deletecategory);

  // banner
  admin.get("/getbanner", BannerController.getbanner);
  admin.post("/addbanner", upload.uploadToS3, BannerController.addbanner);
  admin.get("/editbanner/:id", BannerController.editbanner);
  admin.post("/updatebanner", BannerController.updatebanner);
  admin.delete("/deletebanner/:id", BannerController.deletebanner);

  // offer
  admin.get("/getoffer", OfferController.getoffer);
  admin.post("/addoffer", upload.uploadToS3, OfferController.addoffer);
  admin.get("/editoffer/:id", OfferController.editoffer);
  admin.post("/updateoffer", upload.uploadToS3, OfferController.updateoffer);
  admin.delete("/deleteoffer/:id", OfferController.deleteoffer);

  // banner
  admin.get("/getproduct", ProductController.getproduct);
  admin.post("/addProduct", ProductController.addProduct);
  admin.get("/editproduct/:id", ProductController.editproduct);
  admin.post("/updateproduct", ProductController.updateproduct);
  admin.delete("/deleteproduct/:id", ProductController.deleteproduct);

  admin.get("/distributor_list", DistributorController.distributor_list);
  admin.post("/distributor_detail", DistributorController.distributor_detail);
  admin.post("/distributor_approve", DistributorController.distributor_approve);
  admin.get("/distributor_request", DistributorController.distributor_request);

  admin.get("/retailer_list", RetailerController.retailer_list);
  admin.get("/retailer_request", RetailerController.retailer_request);
  admin.post("/retailer_approve", RetailerController.retailer_approve);
  admin.post("/retailer_detail", RetailerController.retailer_detail);

  admin.get("/all_order", AdminController.all_order);
  admin.post("/order_status_change", AdminController.order_status_change);
  admin.post("/order_detail", AdminController.order_detail);
  admin.get("/return_order_request", AdminController.return_order_request);
  admin.get("/return_order_accepted", AdminController.return_order_accepted);
  admin.get(
    "/get_all_return_delivered_order",
    AdminController.get_all_return_delivered_order
  );
  admin.post("/return_order_deliver", AdminController.return_order_deliver);
  admin.get("/all_payout_request/:id", AdminController.all_payout_request);
  admin.post("/accept_payout", AdminController.accept_payout);
  admin.post(
    "/bulkupload",
    upload.normaluploadMiddleware,
    ProductController.bulk_upload
  );
  admin.get("/searchProduct", ProductController.searchProduct);
  admin.get("/get_return_admin", AdminController.get_return_admin);
  admin.get("/distributor_search", DistributorController.distributor_search);
  admin.get("/retailer_search", RetailerController.retailer_search);

  admin.get("/cancel_order_retailer", RetailerController.cancel_order_retailer);
  admin.get("/cancel_order_admin", RetailerController.cancel_order_admin);
  admin.get("/order_details_admin", AdminController.order_details);
  // admin.get("/get_invoice", AdminController.get_invoice);
};
