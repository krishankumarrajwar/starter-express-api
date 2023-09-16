const serverless = require('serverless-http');

const express =  require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
var cors = require('cors');
const { response } = require("express");
const app = express();
require("./config");
require("dotenv").config();
const PORT = process.env.PORT || 443;



app.use(cors())


app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

app.use(express.static('public'));  
app.use('/images', express.static('images'));

// include routes 
require('./app/Routes/Routes.js')(app);
require('./app/Routes/Adminroute.js')(app);

app.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  
});

app.get('/', (req, res) => {
  try {
      res.json({
          success: true,
          message: "Welcome to Meddaily",
      });
  } catch (error) {
      console.log(error);
      res.status(400).json({
          success: false,
          error: error.message
      })
  }
});


// check connection 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

// app.get('/api/info', (req, res) => {
//   res.send({ application: 'sample-app', version: '1' });
// });
// app.post('/api/v1/getback', (req, res) => {
//   res.send({ ...req.body });
// });

app.listen(PORT,()=>{
  console.log(`PORT Listening ${PORT}`);
});

// module.exports.handler = serverless(app);
