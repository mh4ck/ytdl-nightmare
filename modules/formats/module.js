const formats = require(__dirname + "/formats");

exports.getFormatsFromUrl = (url) => {
  let parsedUrl = new URL(url);
  let itags = parsedUrl.searchParams.get("aitags");
  let itagsArr = [];
  if (itags) {
    itagsArr = itags.split(",");
  }

  let itagsFormat = [];
  if (itagsArr.length >= 1) {
    itagsArr.forEach((itagNum) => {
      itagsFormat.push(formats[itagNum]);
    });
  }
  return itagsFormat;
};

exports.hasAudio = (itag) => {
  if (typeof formats[itag] == "undefined") throw new Error("Undefined itag " + itag);

  let curFormat = formats[itag];
  if (curFormat.audioBitrate != null) {
    return true;
  }
  return false;
};

exports.hasVideo = (itag) => {
  if (typeof formats[itag] == "undefined") throw new Error("Undefined itag " + itag);

  let curFormat = formats[itag];
  if (curFormat.bitrate != null) {
    return true;
  }
  return false;
};
