// middleware/auth.js
import jwt from "jsonwebtoken";
import jwks from "jwks-rsa";
import dotenv from "dotenv";

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

export default function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ["RS256"],
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    },
    (err, decoded) => {
      if (err) {
        console.error("❌ Invalid token:", err.message);
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = decoded;
      next();
    }
  );
}
