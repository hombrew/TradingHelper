const ApexLogsTransport = require("apex-logs-winston");
const winston = require("winston");
const {
  APEX_LOGS_URL,
  APEX_LOGS_AUTH_TOKEN,
  APEX_LOGS_PROJECT_ID,
} = require("../../config/constants");

class LogService {
  constructor(url, authToken, projectId) {
    const apex = new ApexLogsTransport({
      url,
      authToken,
      projectId,
    });

    const logger = winston.createLogger({
      levels: winston.config.syslog.levels,
      transports: [apex],
      defaultMeta: { program: "api", host: "api-01" },
    });

    this.logger = logger;
  }

  info(message, ...params) {
    const data = this._extractData(params);
    this.logger.info(message, { data });
  }

  error(message, ...params) {
    const error = this._extractData(params);
    this.logger.error(message, { error });
  }

  warn(message, ...params) {
    const warning = this._extractData(params);
    this.logger.warning(message, { warning });
  }

  _extractData(params) {
    return params.length === 1 ? params[0] : params;
  }
}

module.exports.LogService = new LogService(
  APEX_LOGS_URL,
  APEX_LOGS_AUTH_TOKEN,
  APEX_LOGS_PROJECT_ID
);
