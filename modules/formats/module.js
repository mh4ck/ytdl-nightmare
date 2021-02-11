const formats = require(__dirname + '/formats');

exports.getFormatsFromUrl = (url) => {
  let parsedUrl = new URL(url);
  let itags = parsedUrl.searchParams.get('aitags');
  let itagsArr = [];
  if (itags) {
    itagsArr = itags.split(',');
  }

  let itagsFormat = [];
  if (itagsArr.length >= 1) {
    itagsArr.forEach((itagNum) => {
      itagsFormat.push(formats[itagNum]);
    });
  }

  return itagsFormat;
};
