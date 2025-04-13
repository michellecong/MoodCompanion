// middleware/authMiddleware.js (ESM version)

import jwt from "jsonwebtoken";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

console.log("🔐 MIDDLEWARE: JWT_SECRET used to verify:", `"${process.env.JWT_SECRET}"`);

/**
 * validate the token provided by the user
 */
export default function (req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "visit rejected for reason of no token" });
  }
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "visit rejected for reason of no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "invalid token" });
  }
}
