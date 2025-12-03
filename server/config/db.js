const mongoose = require("mongoose");
require('dotenv').config();

exports.connectDB = async (mongoose) => {
  try {
    const dbUri = process.env.DATABASE || "mongodb://localhost:27017/ecommerce";
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Database Connected Successfully");
  } catch (err) {
    console.error("Database Not Connected:", err.message);
    throw err;
  }
}
