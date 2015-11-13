var http = require('http');
var initState = false;
var conf = {
  hostname : "localhost",
  port : 8384,
};
function setConfig(options) {
  if (options.apikey) {
    initState = true;
    conf.apikey = options.apikey;
    if (options.hostname) {
      conf.hostname = options.hostname;
    }
    if (options.port) {
      conf.port = options.port;
    }
    return true;
  }else{
    initState = false;
    return false;
  }
}
function request(path, method, callback, data) {
  if (initState) {
    var options = {
      hostname: conf.hostname,
      port: conf.port,
      path: "/rest/"+path,
      method: method,
      headers: {
        'Content-Type':     'application/json',
        'X-API-Key':        conf.apikey,
      }
    };
    if (data) {
      options.headers["Content-Length"] = data.length;
    }
    var response = {};
    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      var response = {
        status: res.statusCode,
        id: res.headers["x-syncthing-id"],
        version: res.headers["x-syncthing-version"],
        date: res.headers.date,
        connection: res.headers.connection,
        body: {}
      };
      res.on('data', function (chunk) {
        response.body = JSON.parse(chunk);
        callback(response);
      });
    });
    req.on('error', function(err) {
      callback('error with request: ' + err.message);
    });
    if (data) {
      req.write(data);
    }
    req.end();
  }else {
    callback("Please initiate first");
  }
}
module.exports = {
  //SYSTEM
  init: function (options, callback) {
    if (setConfig(options)) {
      request("system/ping", "GET", function (res) {
        callback(true);
      });
    }else {
      callback(false);
    }
  },
  system: {
    ping: function (callback) {
      request("system/ping", "GET", function (res) {
        callback(res);
      });
    },
    shutdown: function (callback) {
      request("system/shutdown", "POST", function () {
        callback();
      });
    },
    restart: function (callback) {
      request("system/restart", "POST", function () {
        callback();
      });
    },
    version: function (callback) {
      request("system/version", "GET", function (res) {
        callback(res);
      });
    },
    status: function (callback) {
      request("system/status", "GET", function (res) {
        callback(res);
      });
    },
    connections: function (callback) {
      request("system/connections", "GET", function (res) {
        callback(res);
      });
    },
    setConfig: function (config, callback) {
      request("system/config", "POST", function (res) {
        callback(res);
      }, config);
    },
    getConfig: function (callback) {
      request("system/config", "GET", function (res) {
        callback(res);
      });
    },
    debug: function (callback) {
      request("system/debug", "GET", function (res) {
        callback(res);
      });
    },
    getDiscovery: function (callback) {
      request("system/discovery", "GET", function (res) {
        callback(res);
      });
    },
    setDiscovery: function (device, address, callback) {
      request("system/discovery?device="+device+"&addr="+address, "POST", function (res) {
        callback(res);
      });
    },
    errors: function (callback) {
      request("system/error", "GET", function (res) {
        callback(res);
      });
    },
    clearErrors: function (callback) {
      request("system/error/clear", "POST", function (res) {
        callback(res);
      });
    },
    logs: function (callback) {
      request("system/log", "GET", function (res) {
        callback(res);
      });
    },
    getUpgrade: function (callback) {
      request("system/upgrade", "GET", function (res) {
        callback(res);
      });
    },
    setUpgrade: function (callback) {
      request("system/upgrade", "POST", function (res) {
        callback(res);
      });
    }
  },
  //DB
  db: {
    scan: function (folder, callback) {
      request("db/scan?folder="+folder, "POST", function () {
        callback();
      });
    },
    status: function (folder, callback) {
      request("db/status?folder="+folder, "GET", function (res) {
        callback(res);
      });
    },
    browse: function (folder, levels, callback, subdir) {
      var urlTail;
      if (subdir) {
        urlTail = "db/browse?folder="+folder+"&prefix="+subdir+"&levels="+levels;
      }else {
        urlTail = "db/browse?folder="+folder+"&levels="+levels;
      }
      request(urlTail, "GET", function (res) {
        callback(res);
      });
    },
    completion: function (device, folder, callback) {
      request("db/completion?device="+device+"&folder="+folder, "GET", function (res) {
        callback(res);
      });
    },
    file: function (folder, file, callback) {
      request("db/file?folder="+folder+"&file="+file, "GET", function (res) {
        callback(res);
      });
    },
    getIgnores: function (folder, callback) {
      request("db/ignores?folder="+folder, "GET", function (res) {
        callback(res);
      });
    },
    setIgnores: function (folder, ingores, callback) {
      request("db/ignores?folder="+folder, "POST", function (res) {
        callback(res);
      }, ignores);
    },
    need: function (folder, callback) {
      request("db/ignores?folder="+folder, "GET", function (res) {
        callback(res);
      });
    },
    prio: function (folder, file, callback) {
      request("db/ignores?folder="+folder+"&file="+file, "POST", function (res) {
        callback(res);
      });
    },
  },
  stats: {
    devices: function (callback) {
      request("stats/device", "GET", function (res) {
        callback(res);
      });
    },
    folders: function (callback) {
      request("stats/folder", "GET", function (res) {
        callback(res);
      });
    },
  },
  misc: {
    folders: function (device, callback) {
      request("svc/deviceid?id="+device, "GET", function (res) {
        callback(res);
      });
    },
    lang: function (callback) {
      request("svc/lang", "GET", function (res) {
        callback(res);
      });
    },
    report: function (callback) {
      request("svc/report", "GET", function (res) {
        callback(res);
      });
    }
  }
};
