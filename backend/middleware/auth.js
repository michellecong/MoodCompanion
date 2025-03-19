const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * 验证用户令牌的中间件
 */
module.exports = function (req, res, next) {
  // 从请求头获取令牌
  const token = req.header("x-auth-token");

  // 检查是否提供了令牌
  if (!token) {
    return res.status(401).json({ message: "没有提供认证令牌，拒绝访问" });
  }

  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 将用户信息添加到请求对象
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "令牌无效" });
  }
};
