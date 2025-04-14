// middleware/auth.js
import jwt from "jsonwebtoken";
import jwks from "jwks-rsa";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

// 创建 JWKS 客户端以获取 Auth0 公钥
const client = jwks({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

// 从令牌头中提取签名密钥
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      console.error("JWKS error:", err);
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export default async function (req, res, next) {
  console.log("Auth middleware started processing request");
  const authHeader = req.headers.authorization;

  // 记录请求类型和内容
  console.log("Request method:", req.method);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Authorization:", authHeader ? "Present" : "Missing");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No bearer token in authorization header");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token received, length:", token.length);

  try {
    // 先检查是否为 Auth0 令牌
    const tokenParts = token.split(".");

    if (tokenParts.length !== 3) {
      console.error("Invalid token format - not a JWT");
      return res.status(401).json({ message: "Invalid token format" });
    }

    // 尝试解码令牌头部（不验证）来确定令牌类型
    const headerData = JSON.parse(
      Buffer.from(tokenParts[0], "base64").toString()
    );
    console.log("Token header:", headerData);

    // Auth0 令牌通常使用 RS256 算法，有 kid 字段
    const isAuth0Token =
      headerData.alg === "RS256" && headerData.kid && token.length > 500;

    console.log("Token analysis:", {
      algorithm: headerData.alg,
      hasKid: !!headerData.kid,
      tokenLength: token.length,
      isAuth0Token,
    });

    if (isAuth0Token) {
      console.log("Processing as Auth0 token");

      // 创建一个 Promise 包装的 verify 函数，以便更好地处理错误
      const verifyAuth0Token = () => {
        return new Promise((resolve, reject) => {
          jwt.verify(
            token,
            getKey,
            {
              algorithms: ["RS256"],
              audience: process.env.AUTH0_AUDIENCE,
              issuer: `https://${process.env.AUTH0_DOMAIN}/`,
            },
            (err, decoded) => {
              if (err) reject(err);
              else resolve(decoded);
            }
          );
        });
      };

      try {
        // 验证 Auth0 令牌
        const decoded = await verifyAuth0Token();
        console.log("Auth0 token verified successfully");

        // 从令牌中提取 Auth0 ID
        const auth0Id = decoded.sub;
        console.log("Auth0 ID from token:", auth0Id);

        // 通过 Auth0 ID 在数据库中查找用户
        const user = await User.findOne({ auth0Id });

        if (!user) {
          console.error(`User with Auth0 ID ${auth0Id} not found in database`);
          return res.status(401).json({
            message:
              "User not found in database. Please log out and log in again.",
          });
        }

        console.log(`User found in database: ${user._id} (${user.username})`);

        // 将用户信息添加到请求对象中，确保 id 是字符串
        req.user = {
          id: user._id.toString(),
          auth0Id: user.auth0Id,
          role: user.role || "user",
        };

        console.log("User info attached to request:", req.user);
        next();
      } catch (authError) {
        console.error("❌ Auth0 token verification failed:", authError);
        return res.status(401).json({
          message: "Invalid token",
          error: authError.message,
        });
      }
    } else {
      console.log("Processing as custom JWT token");

      // 验证传统 JWT 令牌
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not set in environment variables!");
        return res.status(500).json({ message: "Server configuration error" });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("JWT token verified successfully, user ID:", decoded.id);

        // 确保 id 存在且为字符串
        req.user = {
          ...decoded,
          id: decoded.id.toString(),
        };

        console.log("User info attached to request:", req.user);
        next();
      } catch (jwtError) {
        console.error("❌ Invalid JWT token:", jwtError.message);
        return res.status(401).json({
          message: "Invalid token",
          error: jwtError.message,
        });
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error in auth middleware:", error);
    return res.status(500).json({
      message: "Authentication error",
      error: error.message,
    });
  }
}
