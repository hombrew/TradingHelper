const {
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DB,
} = require("../../config/constants");
const mongoose = require("mongoose");

const conection = mongoose.connect(
  `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_DB}`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

module.exports.conection = conection;
