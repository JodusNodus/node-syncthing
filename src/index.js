"use strict"
import request from "request"
import {EventEmitter} from 'events'
import util from 'util'
//Config
let config = {
  hostname: "",
  port: 8384,
  apiKey: "",
  eventListener: false,
  constructor: function({hostname="localhost", port=8384, apiKey="", eventListener=false, https=false, username=false, password=false}) {
    this.https = https
    this.hostname = hostname
    this.port = port
    this.apiKey = apiKey
    this.eventListener = eventListener
    this.username = username
    this.password = password
  }
}
function req({method="system", endpoint="ping", post=false, body="", attr}, callback) {
  attr = attr ? "?"+attr
  .filter(item => item.val)
  .map((item) => item.key+"="+encodeURI(item.val)).join("&") : ""
  endpoint = endpoint ? "\/"+endpoint : ""
  let options = {
    method: post ? "POST" : "GET",
    url: `${config.https ? 'https' : 'http'}://${config.hostname}:${config.port}/rest/${method}${endpoint}${attr}`,
    headers: {'Content-Type': 'application/json', 'X-API-Key': config.apiKey},
    json: true,
    body,
    rejectUnauthorized: false,
    auth: (config.username && config.password) && {
      user: config.username,
      pass: config.password,
      sendImmediately: true
    }
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

function lowerCaseFirst(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
function Syncthing(options) {
  config.constructor(options)
  //Events
  if (config.eventListener) {
    EventEmitter.call(this);
    let iterator = (since) => {
      let attr = [{key: "since", val: since}]
      callReq({method: "events", endpoint: false, attr}).then((eventArr) => {
        if (since != 0) {
          eventArr.forEach((e) => {
            this.emit(lowerCaseFirst(e.type), e.data)
          })
        }
        since = eventArr[eventArr.length -1].id
        setTimeout(() => iterator(since), 100)
      }).catch((err) => {
        this.emit("error", err)
      })
    }
    iterator(0)
  }
}
util.inherits(Syncthing, EventEmitter)
Syncthing.prototype.system = {
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
  },
  pause (device, cb) {
    let attr = [{ key: "device", val: device}]
    return callReq({endpoint: "pause", post: true, attr}, cb)
  },
  resume (device, cb) {
    let attr = [{ key: "device", val: device}]
    return callReq({endpoint: "resume", post: true, attr}, cb)
  }
} 
//DB
Syncthing.prototype.db = {
  scan (folder, subdir, cb) {
    let attr = [{key: "folder", val: folder}]
    if (typeof subdir == "function") {
      cb = subdir
      subdir = null
    }else {
      attr.push({key: "sub", val: subdir})
    }
    return callReq({method: "db", endpoint: "scan", attr, post: true}, cb)
  },
  status (folder, cb) {
    return callReq({method: "db", endpoint: "status", attr: [{key: "folder", val: folder}]}, cb)
  },
  browse (folder, levels=1, subdir, cb) {
    let attr = [{key: "folder", val: folder}, {key: "levels", val: levels}]
    if (typeof subdir == "function") {
      cb = subdir
      subdir = null
    }else if (typeof levels == "function") {
      cb = levels
      levels = null
      subdir = null
    }else {
      attr.push({key: "prefix", val: subdir})
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
}
Syncthing.prototype.stats = {
  devices (cb) {
    return callReq({method: "stats", endpoint: "device"}, cb)
  },
  folders (cb) {
    return callReq({method: "stats", endpoint: "folder"}, cb)
  }
},
Syncthing.prototype.misc = {
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


module.exports = Syncthing
