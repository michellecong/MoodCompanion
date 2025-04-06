const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

console.log("🔐 MIDDLEWARE: JWT_SECRET used to verify:", `"${process.env.JWT_SECRET}"`);

/**
 * validate the token provided by the user
 */
module.exports = function (req, res, next) {
  // get token from header
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "visit rejected for reason of no token" });
  }
  const token = authHeader.replace("Bearer ", "");

  // check if token exists
  if (!token) {
    return res
      .status(401)
      .json({ message: "visit rejected for reason of no token" });
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "invalid token" });
  }
};