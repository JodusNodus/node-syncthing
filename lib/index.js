'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _events = require('events');

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lowerCaseFirst = function lowerCaseFirst(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

function syncthing(options) {
  var _this = this;

  //Merge defaults with supplied options
  var config = _extends({
    hostname: 'localhost',
    port: 8384,
    apiKey: undefined,
    eventListener: false,
    username: undefined,
    password: undefined,
    https: false
  }, options);

  var req = (0, _request2.default)(config);

  //Events
  if (config.eventListener) {
    (function () {
      //Become event emitter
      _util2.default.inherits(syncthing, _events.EventEmitter);

      _events.EventEmitter.call(_this);

      //Event request loop
      var iterator = function iterator(since) {

        var attr = [{ key: 'since', val: since }];

        req({ method: 'events', endpoint: false, attr: attr }).then(function (eventArr) {

          //Check for event count on first request iteration
          if (since != 0) {
            eventArr.forEach(function (e) {
              _this.emit(lowerCaseFirst(e.type), e.data);
            });
          }

          //Update event count
          since = eventArr[eventArr.length - 1].id;

          setTimeout(function () {
            return iterator(since);
          }, 100);
        }).catch(function (err) {
          _this.emit('error', err);

          //Try to regain connection & reset event counter
          setTimeout(function () {
            return iterator(0);
          }, 500);
        });
      };
      iterator(0);
    })();
  }

  return methods(req);
}

var methods = function methods(req) {
  return {
    system: {
      ping: function ping(cb) {
        return req({}, cb);
      },
      shutdown: function shutdown(cb) {
        return req({ endpoint: 'shutdown', post: true }, cb);
      },
      restart: function restart(cb) {
        return req({ endpoint: 'restart', post: true }, cb);
      },
      version: function version(cb) {
        return req({ endpoint: 'version' }, cb);
      },
      status: function status(cb) {
        return req({ endpoint: 'status' }, cb);
      },
      connections: function connections(cb) {
        return req({ endpoint: 'connections' }, cb);
      },
      setConfig: function setConfig(body, cb) {
        return req({ endpoint: 'config', post: true, body: body }, cb);
      },
      getConfig: function getConfig(cb) {
        return req({ endpoint: 'config' }, cb);
      },
      debug: function debug(cb) {
        return req({ endpoint: 'debug' }, cb);
      },
      getDiscovery: function getDiscovery(cb) {
        return req({ endpoint: 'discovery' }, cb);
      },
      setDiscovery: function setDiscovery(dev, addr, cb) {
        var attr = [{ key: 'device', val: dev }, { key: 'addr', val: addr }];
        return req({ endpoint: 'discovery', attr: attr, post: true }, cb);
      },

      errors: function errors(cb) {
        return req({ endpoint: 'error' }, cb);
      },
      clearErrors: function clearErrors(cb) {
        return req({ endpoint: 'error/clear', post: true }, cb);
      },
      logs: function logs(cb) {
        return req({ endpoint: 'log' }, cb);
      },
      getUpgrade: function getUpgrade(cb) {
        return req({ endpoint: 'upgrade' }, cb);
      },
      upgrade: function upgrade(cb) {
        return req({ endpoint: 'upgrade', post: true }, cb);
      },
      pause: function pause(device, cb) {
        var attr = [{ key: 'device', val: device }];
        return req({ endpoint: 'pause', post: true, attr: attr }, cb);
      },
      resume: function resume(device, cb) {
        var attr = [{ key: 'device', val: device }];
        return req({ endpoint: 'resume', post: true, attr: attr }, cb);
      }
    },
    db: {
      scan: function scan(folder, subdir, cb) {
        var attr = [{ key: 'folder', val: folder }];
        if (typeof subdir == 'function') {
          cb = subdir;
          subdir = null;
        } else {
          attr.push({ key: 'sub', val: subdir });
        }
        return req({ method: 'db', endpoint: 'scan', attr: attr, post: true }, cb);
      },

      status: function status(folder, cb) {
        return req({ method: 'db', endpoint: 'status', attr: [{ key: 'folder', val: folder }] }, cb);
      },
      browse: function browse(folder) {
        var levels = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
        var subdir = arguments[2];
        var cb = arguments[3];

        var attr = [{ key: 'folder', val: folder }, { key: 'levels', val: levels }];
        if (typeof subdir == 'function') {
          cb = subdir;
          subdir = null;
        } else if (typeof levels == 'function') {
          cb = levels;
          levels = null;
          subdir = null;
        } else {
          attr.push({ key: 'prefix', val: subdir });
        }
        return req({ method: 'db', endpoint: 'browse', attr: attr }, cb);
      },
      completion: function completion(device, folder, cb) {
        var attr = [{ key: 'device', val: device }, { key: 'folder', val: folder }];
        return req({ method: 'db', endpoint: 'completion', attr: attr }, cb);
      },
      file: function file(folder, _file, cb) {
        var attr = [{ key: 'folder', val: folder }, { key: 'file', val: _file }];
        return req({ method: 'db', endpoint: 'file', attr: attr }, cb);
      },
      getIgnores: function getIgnores(folder, cb) {
        var attr = [{ key: 'folder', val: folder }];
        return req({ method: 'db', endpoint: 'ignores', attr: attr }, cb);
      },
      setIgnores: function setIgnores(folder, ignores, cb) {
        var attr = [{ key: 'folder', val: folder }];
        if (typeof ignores == 'function') {
          cb = ignores;
          ignores = null;
        } else {
          attr.push({ key: 'ignores', val: ignores });
        }
        return req({ method: 'db', endpoint: 'ignores', post: true, attr: attr }, cb);
      },
      need: function need(folder, cb) {
        var attr = [{ key: 'folder', val: folder }];
        return req({ method: 'db', endpoint: 'need', attr: attr }, cb);
      },
      prio: function prio(folder, file, cb) {
        var attr = [{ key: 'folder', val: folder }, { key: 'file', val: file }];
        return req({ method: 'db', endpoint: 'prio', post: true, attr: attr }, cb);
      }
    },
    stats: {
      devices: function devices(cb) {
        return req({ method: 'stats', endpoint: 'device' }, cb);
      },
      folders: function folders(cb) {
        return req({ method: 'stats', endpoint: 'folder' }, cb);
      }
    },
    misc: {
      deviceId: function deviceId(id, cb) {
        var attr = [{ key: 'id', val: id }];
        return req({ method: 'svc', endpoint: 'deviceid', attr: attr }, cb);
      },

      lang: function lang(cb) {
        return req({ method: 'svc', endpoint: 'lang' }, cb);
      },
      report: function report(cb) {
        return req({ method: 'svc', endpoint: 'report' }, cb);
      }
    }
  };
};

module.exports = syncthing;