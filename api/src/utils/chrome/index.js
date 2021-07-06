const tradingviewFlowsFolder = require("./tradingviewFlows");
const browserFile = require("./browser");

module.exports = {
  ...tradingviewFlowsFolder,
  ...browserFile,
};
