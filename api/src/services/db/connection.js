const mongoose = require("mongoose");
const {
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DB,
} = require("../../config/constants");

function connectDB() {
  return mongoose.connect(
    `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_DB}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
}

module.exports.connectDB = connectDB;
