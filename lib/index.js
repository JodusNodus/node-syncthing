"use strict";

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Config
function Config(_ref) {
  var _ref$hostname = _ref.hostname;
  var hostname = _ref$hostname === undefined ? "localhost" : _ref$hostname;
  var _ref$port = _ref.port;
  var port = _ref$port === undefined ? 8384 : _ref$port;
  var _ref$apiKey = _ref.apiKey;
  var apiKey = _ref$apiKey === undefined ? "" : _ref$apiKey;
  var _ref$eventListener = _ref.eventListener;
  var eventListener = _ref$eventListener === undefined ? false : _ref$eventListener;

  this.hostname = hostname;
  this.port = port;
  this.apiKey = apiKey;
  this.eventListener = eventListener;
}
Config.prototype.get = function () {
  return this;
};
//Function
function Syncthing(options) {
  var config = new Config(options);
  var conf = config.get();
  if (conf.eventListener) {
    var since = 0;
    var checkForEvent = function checkForEvent() {
      var attr = [{ key: "since", val: since }];
      callReq({ method: "events", endpoint: false, attr: attr }, function (err, events) {
        if (!err) {
          var latest = events[events.length - 1];
          console.log(latest);
        }
      });
    };
    setInterval(checkForEvent, 1000);
  }
  function req(_ref2, callback) {
    var _ref2$method = _ref2.method;
    var method = _ref2$method === undefined ? "system" : _ref2$method;
    var _ref2$endpoint = _ref2.endpoint;
    var endpoint = _ref2$endpoint === undefined ? "ping" : _ref2$endpoint;
    var _ref2$post = _ref2.post;
    var post = _ref2$post === undefined ? false : _ref2$post;
    var _ref2$body = _ref2.body;
    var body = _ref2$body === undefined ? "" : _ref2$body;
    var attr = _ref2.attr;

    attr = attr ? "?" + attr.map(function (item) {
      return item.key + "=" + encodeURI(item.val);
    }).join("&") : "";
    endpoint = endpoint ? "\/" + endpoint : "";
    var options = {
      method: post ? "POST" : "GET",
      url: "http://" + conf.hostname + ":" + conf.port + "/rest/" + method + endpoint + attr,
      headers: { 'Content-Type': 'application/json', 'X-API-Key': conf.apiKey },
      json: true,
      body: body
    };
    (0, _request2.default)(options, function (err, res, body) {
      if (!err && res.statusCode == 200) {
        callback(err, typeof body == "string" && body ? JSON.parse(body) : body);
      } else {
        callback(err || res.statusCode + ", " + body);
      }
    });
  }
  function callReq(options, cb) {
    if (cb) {
      req(options, cb);
    } else {
      return new Promise(function (resolve, reject) {
        req(options, function (err, res) {
          return !err ? resolve(res) : reject(err);
        });
      });
    }
  }
  return {
    system: {
      ping: function ping(cb) {
        return callReq({}, cb);
      },
      shutdown: function shutdown(cb) {
        return callReq({ endpoint: "shutdown", post: true }, cb);
      },
      restart: function restart(cb) {
        return callReq({ endpoint: "restart", post: true }, cb);
      },
      version: function version(cb) {
        return callReq({ endpoint: "version" }, cb);
      },
      status: function status(cb) {
        return callReq({ endpoint: "status" }, cb);
      },
      connections: function connections(cb) {
        return callReq({ endpoint: "connections" }, cb);
      },
      setConfig: function setConfig(body, cb) {
        return callReq({ endpoint: "config", post: true, body: body }, cb);
      },
      getConfig: function getConfig(cb) {
        return callReq({ endpoint: "config" }, cb);
      },
      debug: function debug(cb) {
        return callReq({ endpoint: "debug" }, cb);
      },
      getDiscovery: function getDiscovery(cb) {
        return callReq({ endpoint: "discovery" }, cb);
      },
      setDiscovery: function setDiscovery(dev, addr, cb) {
        var attr = [{ key: "device", val: dev }, { key: "addr", val: addr }];
        return callReq({ endpoint: "discovery", attr: attr, post: true }, cb);
      },
      errors: function errors(cb) {
        return callReq({ endpoint: "error" }, cb);
      },
      clearErrors: function clearErrors(cb) {
        return callReq({ endpoint: "error/clear", post: true }, cb);
      },
      logs: function logs(cb) {
        return callReq({ endpoint: "log" }, cb);
      },
      getUpgrade: function getUpgrade(cb) {
        return callReq({ endpoint: "upgrade" }, cb);
      },
      upgrade: function upgrade(cb) {
        return callReq({ endpoint: "upgrade", post: true }, cb);
      }
    },
    //DB
    db: {
      scan: function scan(folder, cb) {
        var attr = [{ key: "folder", val: folder }];
        return callReq({ method: "db", endpoint: "scan", attr: attr, post: true }, cb);
      },
      status: function status(folder, cb) {
        return callReq({ method: "db", endpoint: "status" }, cb);
      },
      browse: function browse(folder) {
        var levels = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
        var subdir = arguments[2];
        var cb = arguments[3];

        var attr = [{ key: "folder", val: folder }, { key: "prefix", val: levels }];
        if (typeof subdir == "function") {
          cb = subdir;
          subdir = null;
        } else if (typeof levels == "function") {
          cb = levels;
          levels = null;
          subdir = null;
        } else {
          attr.push({ key: "subdir", val: subdir });
        }
        return callReq({ method: "db", endpoint: "browse", attr: attr }, cb);
      },
      completion: function completion(device, folder, cb) {
        var attr = [{ key: "device", val: device }, { key: "folder", val: folder }];
        return callReq({ method: "db", endpoint: "completion", attr: attr }, cb);
      },
      file: function file(folder, _file, cb) {
        var attr = [{ key: "folder", val: folder }, { key: "file", val: _file }];
        return callReq({ method: "db", endpoint: "file", attr: attr }, cb);
      },
      getIgnores: function getIgnores(folder, cb) {
        var attr = [{ key: "folder", val: folder }];
        return callReq({ method: "db", endpoint: "ignores", attr: attr }, cb);
      },
      setIgnores: function setIgnores(folder, ignores, cb) {
        var attr = [{ key: "folder", val: folder }];
        if (typeof ignores == "function") {
          cb = ignores;
          ignores = null;
        } else {
          attr.push({ key: "ignores", val: ignores });
        }
        return callReq({ method: "db", endpoint: "ignores", post: true, attr: attr }, cb);
      },
      need: function need(folder, cb) {
        var attr = [{ key: "folder", val: folder }];
        return callReq({ method: "db", endpoint: "need", attr: attr }, cb);
      },
      prio: function prio(folder, file, cb) {
        var attr = [{ key: "folder", val: folder }, { key: "file", val: file }];
        return callReq({ method: "db", endpoint: "prio", post: true, attr: attr }, cb);
      }
    },
    stats: {
      devices: function devices(cb) {
        return callReq({ method: "stats", endpoint: "device" }, cb);
      },
      folders: function folders(cb) {
        return callReq({ method: "stats", endpoint: "folder" }, cb);
      }
    },
    misc: {
      deviceId: function deviceId(id, cb) {
        var attr = [{ key: "id", val: id }];
        return callReq({ method: "svc", endpoint: "deviceid", attr: attr }, cb);
      },
      lang: function lang(cb) {
        return callReq({ method: "svc", endpoint: "lang" }, cb);
      },
      report: function report(cb) {
        return callReq({ method: "svc", endpoint: "report" }, cb);
      }
    }
  };
}
module.exports = Syncthing;
