var debug = require("debug")("nightmare:load-filter");

module.exports = exports = function (Nightmare) {
  Nightmare.action(
    "onBeforeSendHeaders",
    //define the action to run inside Electron
    function (name, options, parent, win, renderer, done) {
      win.webContents.session.webRequest.onBeforeSendHeaders((details, cb) => {
        parent.call("onBeforeSendHeaders", details, (res) => {
          res ? cb(Object.assign({}, res)) : cb({ cancel: false });
        });
      });
      done();
    },
    function (handler, done) {
      this.child.respondTo("onBeforeSendHeaders", handler);
      done();
    }
  );
};
