exports.filename = (str) => {
  str = str.replace(/\s/gi, "_");
  do {
    str = str.replace(/\_\_/gi, "_");
  } while (str.indexOf("__") !== -1);

  str = str.replace(/_+$/, "");
  str = str.replace(/^_+/, "");

  return str;
};
