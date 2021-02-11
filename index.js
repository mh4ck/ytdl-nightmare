const browser = require(__dirname + "/modules/browser");
const downloader = require(__dirname + "/modules/downloader");

exports.info = browser.get;
exports.downloadFromInfo = downloader.run;
