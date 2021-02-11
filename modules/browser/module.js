const Nightmare = require("nightmare");
const mime = require("mime");
require(__dirname + "/nightmare-load-filter")(Nightmare);
const baseUrl = "https://www.youtube.com/watch?v=";

Nightmare.action(
  "onBeforeSendHeaders",
  //define the action to run inside Electron
  function (name, options, parent, win, renderer, done) {
    win.webContents.session.webRequest.onBeforeSendHeaders((details, cb) => {
      // call our event handler
      parent.call("onBeforeSendHeaders", details, (res) => {
        res ? cb(Object.assign({}, res)) : cb({ cancel: false });
      });
    });
    done();
  },
  function (handler, done) {
    // listen for "onBeforeSendHeaders" events
    this.child.respondTo("onBeforeSendHeaders", handler);
    done();
  }
);

/**
 * Requesting the videostream url from a YouTube video
 * @param {string} id
 * @param {object} options
 */
exports.get = (id, opts) => {
  opts = opts || {};

  let options = {
    type: "audio",
    requestOptions: {
      proxy: null,
      headers: {
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36",
        cookie: "",
      },
    },
  };
  options = { ...options, ...opts };

  return new Promise((resolve, reject) => {
    let videoPlaybackReceived = false;
    let videoUrl = null;
    let requestHeaders = null;
    let startTime = Date.now() / 1000;

    let nightmare = new Nightmare({
      show: false,
      switches: {
        "proxy-server": options.requestOptions.proxy,
        "ignore-certificate-errors": true,
      },
      openDevTools: false,
    });

    nightmare
      .filter(
        {
          urls: ["*"],
        },
        function (details, cb) {
          //cancel a specific file
          return cb({
            cancel:
              details.url.indexOf(".jpg") !== -1 ||
              details.url.indexOf(".png") !== -1 ||
              details.url.indexOf(".webm") !== -1 ||
              details.url.indexOf(".webp") !== -1 ||
              details.url.indexOf(".ico") !== -1 ||
              details.url.indexOf(".css") !== -1 ||
              details.url.indexOf(".svg") !== -1 ||
              details.type == "style" ||
              details.type == "png" ||
              details.type == "svg" ||
              details.type == "ico" ||
              details.type == "jpg" ||
              details.type == "jpeg",
          });
        }
      )
      .onBeforeSendHeaders((details, cb) => {
        if (
          details.url.indexOf("videoplayback") !== -1 &&
          details.url.indexOf("mime=" + options.type) !== -1 &&
          details.url.indexOf("&range") !== -1 &&
          !videoPlaybackReceived
        ) {
          videoPlaybackReceived = true;
          videoUrl = details.url;
          requestHeaders = details.headers;
          cb({ cancel: true });
          return;
        }
        if (videoPlaybackReceived) {
          cb({ cancel: true });
          return;
        }
        cb({ cancel: false });
      })
      .header("cookie", options.requestOptions.headers.cookie)
      .header("user-agent", options.requestOptions.headers["user-agent"])
      .goto(baseUrl + id)
      .evaluate(() => {
        return ytInitialPlayerResponse || null;
      })
      .end()
      .then((ytInitialPlayerResponse) => {
        let response = {};
        response.playerResponse = ytInitialPlayerResponse;
        let endTime = Date.now() / 1000;
        response.videoUrl = videoUrl;
        response.requestTime = endTime - startTime;
        resolve(response);
      })
      .catch(reject);
  });
};
