const got = require("got");
const url = require("url");
const fs = require("fs");
const mime = require("mime");
const path = require("path");
const sanitize = require("sanitize-filename");
const utils = require(__dirname + "/../utils");

const getVideoStream = (title, mimeType, path) => {
  let videoName = sanitize(title.toLowerCase());
  videoName = utils.filename(videoName);
  let videoExtension = mime.getExtension(mimeType);
  let videoPath = path + "/" + videoName + "." + videoExtension;
  let videoStream = fs.createWriteStream(videoPath);
  return videoStream;
};

exports.run = (response, filepath) => {
  return new Promise((resolve, reject) => {
    if (typeof response.videoUrl == "undefined") {
      reject(new Error("Can't download from undefined"));
      return;
    }
    let parsedUrl = new URL(response.videoUrl);

    parsedUrl.searchParams.set("range", "0-10380331");
    let videoStream = getVideoStream(response.playerResponse.videoDetails.title, parsedUrl.searchParams.get("mime"), filepath);

    const gotCallback = (gotResponse) => {
      if (gotResponse.headers["content-type"].indexOf("text/plain") == -1) {
        exports.runPartials(gotResponse.requestUrl, videoStream, 0, resolve, reject);
        return;
      }
      got(gotResponse.body).then(gotCallback).catch(reject);
    };

    got(parsedUrl.href).then(gotCallback).catch(reject);
  });
};

exports.runPartials = (url, stream, start, resolve, reject) => {
  start = start || 0;
  let parsedUrl = new URL(url);

  let partialLength = 10380331;
  let length = parseInt(parsedUrl.searchParams.get("clen"));
  let end = start + partialLength;
  if (end > length) {
    end = length;
  }
  parsedUrl.searchParams.set("range", start + "-" + end);

  got({
    url: parsedUrl.href,
    isStream: true,
  })
    .once("error", reject)
    .once("end", () => {
      if (end < length) {
        exports.runPartials(url, stream, end, resolve, reject);
        return;
      }
      let streamPath = stream.path;
      stream.end();
      resolve({
        fullpath: streamPath,
        filename: path.basename(streamPath),
      });
    })
    .pipe(stream, { end: false });
};
