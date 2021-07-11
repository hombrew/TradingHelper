const connectionFile = require("./connection");
const entitiesFile = require("./Entities");

module.exports = {
  ...connectionFile,
  ...entitiesFile,
};
