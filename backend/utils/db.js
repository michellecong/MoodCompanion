const mongoose = require("mongoose");
require("dotenv").config();
// conncet to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log("Already connected to database.");
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("MongoDB Connected.");
};

module.exports = connectDB;
