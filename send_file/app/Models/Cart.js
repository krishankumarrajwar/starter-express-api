const mongoose = require('mongoose');

var  CartSchema = mongoose.Schema({
    user_id: {type:mongoose.Schema.Types.ObjectId,required:true},
    product_id: {type:mongoose.Schema.Types.ObjectId,required:true},
    distributor_id: {type:mongoose.Schema.Types.ObjectId,required:true},
    quantity: {type:Number},
}, 
{
    timestamps: true
});


module.exports = mongoose.model('cart', CartSchema);