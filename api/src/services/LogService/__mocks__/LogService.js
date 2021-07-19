const LogService = {};

LogService.info = jest.fn();

LogService.error = jest.fn();

LogService.warn = jest.fn();

module.exports.LogService = LogService;
