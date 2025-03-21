const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * validate the token provided by the user
 */
module.exports = function (req, res, next) {
  // get token from header
  const token = req.header("x-auth-token");

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
