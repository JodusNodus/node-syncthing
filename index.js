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
        body: {}
      };
      res.on('data', function (chunk) {
        response.body = JSON.parse(chunk);
        callback(null, response);
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
      new request("system/ping", "GET", function (err, res) {
        callback(err, true);
      });
    }else {
      callback("Error");
    }
  },
  system: {
    ping: function (callback) {
      new request("system/ping", "GET", function(err, res) {
        callback(err, res);
      });
    },
    shutdown: function (callback) {
     new request("system/shutdown", "POST", function () {
        callback();
      });
    },
    restart: function (callback) {
     new request("system/restart", "POST", function () {
        callback();
      });
    },
    version: function (callback) {
     new request("system/version", "GET", function(err, res) {
        callback(err, res);
      });
    },
    status: function (callback) {
     new request("system/status", "GET", function(err, res) {
        callback(err, res);
      });
    },
    connections: function (callback) {
     new request("system/connections", "GET", function(err, res) {
        callback(err, res);
      });
    },
    setConfig: function (config, callback) {
     new request("system/config", "POST", function(err, res) {
        callback(err, res, config);
      }, config);
    },
    getConfig: function (callback) {
     new request("system/config", "GET", function(err, res) {
        callback(err, res);
      });
    },
    debug: function (callback) {
     new request("system/debug", "GET", function(err, res) {
        callback(err, res);
      });
    },
    getDiscovery: function (callback) {
     new request("system/discovery", "GET", function(err, res) {
        callback(err, res);
      });
    },
    setDiscovery: function (device, address, callback) {
     new request("system/discovery?device="+device+"&addr="+address, "POST", function(err, res) {
        callback(err, res, device, address);
      });
    },
    errors: function (callback) {
     new request("system/error", "GET", function(err, res) {
        callback(err, res);
      });
    },
    clearErrors: function (callback) {
     new request("system/error/clear", "POST", function(err, res) {
        callback(err, res);
      });
    },
    logs: function (callback) {
     new request("system/log", "GET", function(err, res) {
        callback(err, res);
      });
    },
    getUpgrade: function (callback) {
     new request("system/upgrade", "GET", function(err, res) {
        callback(err, res);
      });
    },
    upgrade: function (callback) {
     new request("system/upgrade", "POST", function(err, res) {
        callback(err, res);
      });
    }
  },
  //DB
  db: {
    scan: function (folder, callback) {
    new  request("db/scan?folder="+folder, "POST", function () {
        callback(folder);
      });
    },
    status: function (folder, callback) {
     new request("db/status?folder="+folder, "GET", function(err, res) {
        callback(err, res, folder);
      });
    },
    browse: function (folder, levels, callback, subdir) {
      var urlTail;
      if (subdir) {
        urlTail = "db/browse?folder="+folder+"&prefix="+subdir+"&levels="+levels;
      }else {
        urlTail = "db/browse?folder="+folder+"&levels="+levels;
      }
      request(urlTail, "GET", function(err, res) {
        callback(err, res, folder, levels, subdir);
      });
    },
    completion: function (device, folder, callback) {
     new request("db/completion?device="+device+"&folder="+folder, "GET", function(err, res) {
        callback(err, res, device, folder);
      });
    },
    file: function (folder, file, callback) {
     new request("db/file?folder="+folder+"&file="+file, "GET", function(err, res) {
        callback(err, res, folder, file);
      });
    },
    getIgnores: function (folder, callback) {
     new request("db/ignores?folder="+folder, "GET", function(err, res) {
        callback(err, res, folder);
      });
    },
    setIgnores: function (folder, ingores, callback) {
     new request("db/ignores?folder="+folder, "POST", function(err, res) {
        callback(err, res, folder, ingores);
      }, ignores);
    },
    need: function (folder, callback) {
     new request("db/ignores?folder="+folder, "GET", function(err, res) {
        callback(err, res, folder);
      });
    },
    prio: function (folder, file, callback) {
     new request("db/ignores?folder="+folder+"&file="+file, "POST", function(err, res) {
        callback(err, res, folder, file);
      });
    },
  },
  stats: {
    devices: function (callback) {
     new request("stats/device", "GET", function(err, res) {
        callback(err, res);
      });
    },
    folders: function (callback) {
     new request("stats/folder", "GET", function(err, res) {
        callback(err, res);
      });
    },
  },
  misc: {
    folders: function (id, callback) {
     new request("svc/deviceid?id="+id, "GET", function(err, res) {
        callback(err, res, id);
      });
    },
    lang: function (callback) {
     new request("svc/lang", "GET", function(err, res) {
        callback(err, res);
      });
    },
    report: function (callback) {
     new request("svc/report", "GET", function(err, res) {
        callback(err, res);
      });
    }
  }
};
