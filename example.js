var syncthing = require('./index.js');
var options = {
  hostname: "localhost",
  port: 8384,
  apikey: "abc123"
};
syncthing.init(options, function (res) {
    syncthing.system.ping(function (res) {
      console.log(res);
    });
});
