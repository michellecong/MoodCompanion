// middleware/auth.js
import jwt from "jsonwebtoken";
import jwks from "jwks-rsa";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

// Create JWKS client to fetch Auth0 public keys
const client = jwks({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

// Extract signing key from the token header
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export default async function (req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(
    "Auth headers:",
    req.headers.authorization ? "Present" : "Missing"
  );

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No bearer token in authorization header");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token received, length:", token.length);
  console.log("Token first 20 chars:", token.substring(0, 20) + "...");

  // Check if token is from Auth0 (longer token that contains Auth0 domain in issuer)
  const tokenParts = token.split(".");
  const isValidJwtFormat = tokenParts.length === 3;
  const isLongToken = token.length > 500;
  const containsAuth0Domain =
    process.env.AUTH0_DOMAIN &&
    token.includes(process.env.AUTH0_DOMAIN.replace(/\./g, "\\."));

  const isAuth0Token = isValidJwtFormat && isLongToken;

  console.log("Token validation check:", {
    isValidJwtFormat,
    isLongToken,
    containsAuth0Domain,
    isAuth0Token,
    auth0Domain: process.env.AUTH0_DOMAIN || "Not set in env",
  });

  if (isAuth0Token) {
    console.log("Processing as Auth0 token");
    // Verify Auth0 token
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      },
      async (err, decoded) => {
        if (err) {
          console.error("❌ Invalid Auth0 token:", err.message);
          return res
            .status(401)
            .json({ message: "Invalid token", error: err.message });
        }

        console.log("Auth0 token verified successfully");
        // Extract Auth0 ID from the token (sub claim)
        const auth0Id = decoded.sub;
        console.log("Auth0 ID from token:", auth0Id);

        // Find user in database by Auth0 ID
        try {
          const user = await User.findOne({ auth0Id });

          if (!user) {
            console.error(
              `User with Auth0 ID ${auth0Id} not found in database`
            );
            return res.status(401).json({
              message:
                "User not found in database. Please log out and log in again.",
            });
          }

          console.log(`User found in database: ${user._id} (${user.username})`);

          // Add user info to request object for use in controllers
          req.user = {
            id: user._id,
            auth0Id: user.auth0Id,
            role: user.role,
          };

          next();
        } catch (error) {
          console.error("Error finding user by Auth0 ID:", error);
          return res.status(500).json({ message: "Server error" });
        }
      }
    );
  } else {
    console.log("Processing as custom JWT token");
    // Verify normal JWT token
    try {
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not set in environment variables!");
        return res.status(500).json({ message: "Server configuration error" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("JWT token verified successfully, user ID:", decoded.id);
      req.user = decoded;
      next();
    } catch (err) {
      console.error("❌ Invalid JWT token:", err.message);
      return res
        .status(401)
        .json({ message: "Invalid token", error: err.message });
    }
  }
}
