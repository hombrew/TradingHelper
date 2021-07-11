const {
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DB,
} = require("../../config/constants");
const mongoose = require("mongoose");

mongoose
  .connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch(console.error.bind(console, "connection error:"));

module.exports.conection = mongoose.connection;
