const ytdlNightmare = require(__dirname + "/../index.js");
const config = {
  headers: {
    cookie: "",
  },
};

console.log(`[Info]: Starting download..`);
let startTime = Math.floor(Date.now() / 1000);
ytdlNightmare
  .info("h9bixr93YZI", {
    requestOptions: {
      headers: {
        cookie: config.headers.cookie,
      },
    },
  })
  .then((info) => {
    let endTimeInfo = Math.floor(Date.now() / 1000);
    let durationInfo = endTimeInfo - startTime;
    console.log(`[Info]: Received info after ${durationInfo}s`);
    let filepath = __dirname; // without ending slash!
    if (info.videoUrl) {
      ytdlNightmare
        .downloadFromInfo(info, filepath, true)
        .then((fileObj) => {
          console.log("Downloaded: ", fileObj);
          let endTime = Math.floor(Date.now() / 1000);
          let duration = endTime - startTime;
          console.log(`[Info]: Finished download completely after ${duration}s`);
        })
        .catch((err) => {
          console.log(err);
        });
      return;
    }
    console.error("Haven't got any videoplayback url.");
  })
  .catch((err) => {
    console.log(err);
  });
