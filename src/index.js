"use strict"
import request from "request"
//Config
function Config({hostname="localhost", port=8384, apiKey="", eventListener=false}) {
  this.hostname = hostname
  this.port = port
  this.apiKey = apiKey
  this.eventListener = eventListener;
}
Config.prototype.get = function () { return this }
//Function
function Syncthing(options) {
  const config = new Config(options)
  const conf = config.get()
  if (conf.eventListener) {
    var since = 0;
    const checkForEvent = () => {
      let attr = [{key: "since", val: since}]
      callReq({method: "events", endpoint: false, attr}, function (err, events) {
        if (!err) {
          let latest = events[events.length - 1]
          console.log(latest)
        }
      });
    }
    setInterval(checkForEvent, 1000)
  }
  function req({method="system", endpoint="ping", post=false, body="", attr}, callback) {
    attr = attr ? "?"+attr.map((item) => item.key+"="+encodeURI(item.val)).join("&") : ""
    endpoint = endpoint ? "\/"+endpoint : ""
    let options = {
      method: post ? "POST" : "GET",
      url: `http://${conf.hostname}:${conf.port}/rest/${method}${endpoint}${attr}`,
      headers: {'Content-Type': 'application/json', 'X-API-Key': conf.apiKey},
      json: true,
      body: body
    }
    request(options, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        callback(err, typeof body == "string" && body ? JSON.parse(body) : body)
      }else {
        callback(err || res.statusCode+", "+body)
      }
    })
  }
   function callReq(options, cb) {
    if(cb){
      req(options, cb);
    }else {
      return new Promise((resolve, reject) => {
        req(options, (err, res) => !err ? resolve(res) : reject(err))
      })
    }
  }
  return {
    system: {
      ping (cb) {
        return callReq({}, cb);
      },
      shutdown (cb) {
        return callReq({endpoint: "shutdown", post: true}, cb);
      },
      restart (cb) {
        return callReq({endpoint: "restart", post: true}, cb);
      },
      version (cb) {
        return callReq({endpoint: "version"}, cb);
      },
      status (cb) {
        return callReq({endpoint: "status"}, cb);
      },
      connections (cb) {
        return callReq({endpoint: "connections"}, cb);
      },
      setConfig (body, cb) {
        return callReq({endpoint: "config", post: true, body}, cb);
      },
      getConfig (cb) {
        return callReq({endpoint: "config"}, cb);
      },
      debug (cb) {
        return callReq({endpoint: "debug"}, cb);
      },
      getDiscovery (cb) {
        return callReq({endpoint: "discovery"}, cb);
      },
      setDiscovery (dev, addr, cb) {
        let attr = [{ key: "device", val: dev}, { key: "addr", val: addr }]
        return callReq({endpoint: "discovery", attr, post: true}, cb)
      },
      errors (cb) {
        return callReq({endpoint: "error"}, cb)
      },
      clearErrors (cb) {
        return callReq({endpoint: "error/clear", post: true}, cb)
      },
      logs (cb) {
        return callReq({endpoint: "log"}, cb)
      },
      getUpgrade (cb) {
        return callReq({endpoint: "upgrade"}, cb)
      },
      upgrade (cb) {
        return callReq({endpoint: "upgrade", post: true}, cb)
      }
    },
    //DB
    db: {
      scan (folder, cb) {
        let attr = [{key: "folder", val: folder}]
        return callReq({method: "db", endpoint: "scan", attr, post: true}, cb)
      },
      status (folder, cb) {
        return callReq({method: "db", endpoint: "status"}, cb)
      },
      browse (folder, levels=1, subdir, cb) {
        let attr = [{key: "folder", val: folder}, {key: "prefix", val: levels}]
        if (typeof subdir == "function") {
          cb = subdir
          subdir = null
        }else if (typeof levels == "function") {
          cb = levels
          levels = null
          subdir = null
        }else {
          attr.push({key: "subdir", val: subdir})
        }
        return callReq({method: "db", endpoint: "browse", attr}, cb)
      },
      completion (device, folder, cb) {
        let attr = [{key: "device", val: device}, {key: "folder", val: folder}]
        return callReq({method: "db", endpoint: "completion", attr}, cb)
      },
      file (folder, file, cb) {
        let attr = [{key: "folder", val: folder}, {key: "file", val: file}]
        return callReq({method: "db", endpoint: "file", attr}, cb)
      },
      getIgnores (folder, cb) {
        let attr = [{key: "folder", val: folder}]
        return callReq({method: "db", endpoint: "ignores", attr}, cb)
      },
      setIgnores (folder, ignores, cb) {
        let attr = [{key: "folder", val: folder}]
        if (typeof ignores == "function") {
          cb = ignores
          ignores = null
        }else {
          attr.push({key: "ignores", val: ignores})
        }
        return callReq({method: "db", endpoint: "ignores", post: true, attr}, cb)
      },
      need (folder, cb) {
        let attr = [{key: "folder", val: folder}]
        return callReq({method: "db", endpoint: "need", attr}, cb)
      },
      prio (folder, file, cb) {
        let attr = [{key: "folder", val: folder}, {key: "file", val: file}]
        return callReq({method: "db", endpoint: "prio", post: true, attr}, cb)
      }
    },
    stats: {
      devices (cb) {
        return callReq({method: "stats", endpoint: "device"}, cb)
      },
      folders (cb) {
        return callReq({method: "stats", endpoint: "folder"}, cb)
      }
    },
    misc: {
      deviceId(id, cb) {
        let attr = [{key: "id", val: id}]
        return callReq({method: "svc", endpoint: "deviceid", attr}, cb)
      },
      lang(cb) {
        return callReq({method: "svc", endpoint: "lang"}, cb)
      },
      report(cb) {
        return callReq({method: "svc", endpoint: "report"}, cb)
      }
    }
  }
}
module.exports = Syncthing
