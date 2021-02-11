const ytdlNightmare = require(__dirname + "/../index.js");
const config = {
  headers: {
    cookie: "",
  },
};

ytdlNightmare
  .info("EtJpPSRXI50", {
    type: "audio",
    requestOptions: {
      headers: {
        cookie: config.headers.cookie,
      },
    },
  })
  .then((info) => {
    let filepath = __dirname; // without ending slash!
    if (info.videoUrl) {
      ytdlNightmare
        .downloadFromInfo(info, filepath)
        .then((fileObj) => {
          console.log("Downloaded: ", fileObj);
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
