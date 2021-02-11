# ytdl-nightmare
YouTube Downloader without deciphering any urls. This downloader using a headless browser.

## Installation

`npm install --save git+https://github.com/mh4ck/ytdl-nightmare.git`

## Usage

Start requesting the Video info
```
const ytdlNightmare = require("ytdl-nightmare");
ytdlNightmare.info('[YouTubeID]').then((info) => {
// info
}).catch((err) => console.log)
```

After you got the info you can use it to download the file
```
const ytdlNightmare = require("ytdl-nightmare");
ytdlNightmare.info('[YouTubeID]', {
  type: "audio" // downloads the Audio since YouTube split the audio and video part
}).then((info) => {
  // info
  ytdlNightmare.downloadFromInfo(info, __dirname).then((fileObj) => {
    console.log("The video has been downloaded to: " + fileObj.fullpath);
  }).catch((err) => console.log)
}).catch((err) => console.log)
```

### Why is there no filename parameter?
Because we are not selecting any format and just using the format loaded initialy by YouTube. 
So we are not able to set the target file extension and just work with the format YouTube offers. 
