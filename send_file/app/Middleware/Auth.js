const jwt = require("jsonwebtoken");
const tokendb = require("../Models/token");

const verifyToken = async (req, resp, next) => {
  const token = req.headers["token"];


  if (!token) {
    resp.send({
      status: false,
      message: "A token is required for authentication",
    });
  }
  // return next();
  try {
    var checkToken = await tokendb.findOne({ token: token });
    // console.log(checkToken)
    if (checkToken) {
      const verify = jwt.verify(token, process.env.JWT_KEY);
      req.user = verify.user_id;

      return next();
    } else {
      console.log(checkToken)
      throw new Error("invalid token")
    }
  } catch (err) {
    console.log(err);
    // resp.send({ status: false, message: "Invalid Token" });
  }
};

module.exports = verifyToken;