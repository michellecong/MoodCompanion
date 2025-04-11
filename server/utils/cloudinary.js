const cloudinary = require("cloudinary").v2;

// Cloudinary will automatically use CLOUDINARY_URL if present
// Otherwise it will use the individual environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
