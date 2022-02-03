const Nightmare = require("nightmare");
const url = require("url");
require(__dirname + "/nightmare-load-filter")(Nightmare);
require(__dirname + "/nightmare-onbeforesendheaders")(Nightmare);
const formats = require(__dirname + "/../formats");
const baseUrl = "https://www.youtube.com/watch?v=";

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
    let audioPlaybackReceived = false;
    let videoUrl = null;
    let audioUrl = null;
    let isAudioVideo = false;
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
              details.type == "manifest" ||
              details.type == "style" ||
              details.type == "png" ||
              details.type == "gif" ||
              details.type == "svg+xml" ||
              details.type == "x-ico" ||
              details.type == "jpeg",
          });
        }
      )
      .onBeforeSendHeaders((details, cb) => {
        let parsedDetailsUrl = new URL(details.url);

        if (parsedDetailsUrl.pathname != "/videoplayback" && !videoPlaybackReceived) {
          cb({ cancel: false });
          return;
        }

        let itag = parsedDetailsUrl.searchParams.get("itag");

        if (formats.hasAudio(itag)) {
          audioPlaybackReceived = true;
          audioUrl = parsedDetailsUrl.href;
        }

        if (formats.hasVideo(itag)) {
          videoPlaybackReceived = true;
          videoUrl = parsedDetailsUrl.href;
        }

        if (formats.hasVideo(itag) && formats.hasAudio(itag)) isAudioVideo = true;

        if (videoPlaybackReceived && audioPlaybackReceived) {
          cb({ cancel: true });
          return;
        }
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
        response.audioUrl = audioUrl;
        response.isAudioVideo = isAudioVideo;
        response.requestTime = endTime - startTime;
        resolve(response);
      })
      .catch(reject);
  });
};
