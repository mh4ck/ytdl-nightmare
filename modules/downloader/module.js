const got = require("got");
const url = require("url");
const fs = require("fs");
const mime = require("mime");
const path = require("path");
const sanitize = require("sanitize-filename");
const utils = require(__dirname + "/../utils");

const getFileStream = (title, mimeType, outputFolder) => {
  let videoName = sanitize(title.toLowerCase());
  videoName = utils.filename(videoName);
  let videoExtension = mime.getExtension(mimeType);
  let videoPath = path.join(outputFolder, videoName + "." + videoExtension);
  let fileStream = fs.createWriteStream(videoPath);
  return fileStream;
};

exports.run = (response, directory, audioOnly) => {
  audioOnly = audioOnly || false;
  return new Promise((resolve, reject) => {
    if (typeof response.videoUrl == "undefined" || typeof response.videoUrl == null) {
      reject(new Error("Can't download from undefined"));
      return;
    }

    if (audioOnly && response.audioUrl != null) {
      exports
        .fetchAudio(response, directory)
        .then((response) => {
          resolve({
            fullpathAudio: response.fullpath,
            filenameAudio: response.filename,
          });
        })
        .catch(reject);
      return;
    }

    let promises = [];
    promises.push(exports.fetchVideo(response, directory));
    if (response.audioUrl != null) promises.push(exports.fetchAudio(response, directory));
    Promise.all(promises).then((responses) => {
      let response = {};
      response.fullpathVideo = responses[0].fullpath;
      response.filenameVideo = responses[0].filename;
      if (typeof responses[1] != "undefined") {
        response.fullpathAudio = responses[1].fullpath;
        response.filenameAudio = responses[1].filename;
      }
      resolve(response);
    });
  });
};

exports.fetchVideo = (response, directory) => {
  return new Promise((resolve, reject) => {
    let parsedUrl = new URL(response.videoUrl);
    parsedUrl.searchParams.set("range", "0-10380331");
    let fileStream = getFileStream(response.playerResponse.videoDetails.title, parsedUrl.searchParams.get("mime"), directory);

    const gotCallback = (gotResponse) => {
      if (gotResponse.headers["content-type"].indexOf("text/plain") == -1) {
        exports.runPartials(gotResponse.requestUrl, fileStream, 0, resolve, reject);
        return;
      }
      got(gotResponse.body).then(gotCallback).catch(reject);
    };

    got(parsedUrl.href).then(gotCallback).catch(reject);
  });
};

exports.fetchAudio = (response, directory) => {
  return new Promise((resolve, reject) => {
    let parsedUrl = new URL(response.audioUrl);
    parsedUrl.searchParams.set("range", "0-10380331");
    let fileStream = getFileStream(response.playerResponse.videoDetails.title, parsedUrl.searchParams.get("mime"), directory);

    const gotCallback = (gotResponse) => {
      if (gotResponse.headers["content-type"].indexOf("text/plain") == -1) {
        exports.runPartials(gotResponse.requestUrl, fileStream, 0, resolve, reject);
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
