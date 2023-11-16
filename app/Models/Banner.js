const mongoose = require('mongoose');

var  CategorySchema = mongoose.Schema({
    image: String,
    name: String,
    time:{type:Number,default:Date.now}
}, 
{
    timestamps: true
});


module.exports = mongoose.model('banner', CategorySchema);