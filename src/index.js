import { EventEmitter } from 'events'
import util from 'util'

import request from './request'

const lowerCaseFirst = str => str.charAt(0).toLowerCase() + str.slice(1)

function syncthing(options) {

  //Merge defaults with supplied options
  const config = {
    hostname: 'localhost',
    port: 8384,
    apiKey: undefined,
    eventListener: false,
    username: undefined,
    password: undefined,
    https: false,
    ...options,
  }

  const req = request(config)

  //Events
  if (config.eventListener) {
    //Become event emitter
    util.inherits(syncthing, EventEmitter)

    EventEmitter.call(this)

    //Event request loop
    let iterator = (since) => {

      let attr = [{key: 'since', val: since}]

      req({method: 'events', endpoint: false, attr}).then((eventArr) => {

        //Check for event count on first request iteration
        if (since != 0) {
          eventArr.forEach((e) => {
            this.emit(lowerCaseFirst(e.type), e.data)
          })
        }

        //Update event count
        since = eventArr[eventArr.length -1].id

        setTimeout(() => iterator(since), 100)

      }).catch((err) => {
        this.emit('error', err)

        //Try to regain connection & reset event counter
        setTimeout(() => iterator(0), 500)
      })
    }
    iterator(0)
  }

  return methods(req)
}

const methods = (req) => ({
  system: {
    ping: cb => req({}, cb),
    shutdown: cb => req({endpoint: 'shutdown', post: true}, cb),
    restart: cb => req({endpoint: 'restart', post: true}, cb),
    version: cb => req({endpoint: 'version'}, cb),
    status: cb => req({endpoint: 'status'}, cb),
    connections: cb => req({endpoint: 'connections'}, cb),
    setConfig: (body, cb) => req({endpoint: 'config', post: true, body}, cb),
    getConfig: cb => req({endpoint: 'config'}, cb),
    debug: cb => req({endpoint: 'debug'}, cb),
    getDiscovery: cb => req({endpoint: 'discovery'}, cb),
    setDiscovery (dev, addr, cb) {
      let attr = [{ key: 'device', val: dev}, { key: 'addr', val: addr }]
      return req({endpoint: 'discovery', attr, post: true}, cb)
    },
    errors: cb => req({endpoint: 'error'}, cb),
    clearErrors: cb => req({endpoint: 'error/clear', post: true}, cb),
    logs: cb => req({endpoint: 'log'}, cb),
    getUpgrade: cb => req({endpoint: 'upgrade'}, cb),
    upgrade: cb => req({endpoint: 'upgrade', post: true}, cb),
    pause (device, cb) {
      let attr = [{ key: 'device', val: device}]
      return req({endpoint: 'pause', post: true, attr}, cb)
    },
    resume (device, cb) {
      let attr = [{ key: 'device', val: device}]
      return req({endpoint: 'resume', post: true, attr}, cb)
    },
  },
  db: {
    scan (folder, subdir, cb) {
      let attr = [{key: 'folder', val: folder}]
      if (typeof subdir == 'function') {
        cb = subdir
        subdir = null
      }else {
        attr.push({key: 'sub', val: subdir} )
      }
      return req({method: 'db', endpoint: 'scan', attr, post: true}, cb)
    },
    status: (folder, cb) => req({method: 'db', endpoint: 'status', attr: [{key: 'folder', val: folder}]}, cb),
    browse (folder, levels=1, subdir, cb) {
      let attr = [{key: 'folder', val: folder}, {key: 'levels', val: levels}]
      if (typeof subdir == 'function') {
        cb = subdir
        subdir = null
      }else if (typeof levels == 'function') {
        cb = levels
        levels = null
        subdir = null
      }else {
        attr.push({key: 'prefix', val: subdir})
      }
      return req({method: 'db', endpoint: 'browse', attr}, cb)
    },
    completion (device, folder, cb) {
      let attr = [{key: 'device', val: device}, {key: 'folder', val: folder}]
      return req({method: 'db', endpoint: 'completion', attr}, cb)
    },
    file (folder, file, cb) {
      let attr = [{key: 'folder', val: folder}, {key: 'file', val: file}]
      return req({method: 'db', endpoint: 'file', attr}, cb)
    },
    getIgnores (folder, cb) {
      let attr = [{key: 'folder', val: folder}]
      return req({method: 'db', endpoint: 'ignores', attr}, cb)
    },
    setIgnores (folder, ignores, cb) {
      let attr = [{key: 'folder', val: folder}]
      if (typeof ignores == 'function') {
        cb = ignores
        ignores = null
      }else {
        attr.push({key: 'ignores', val: ignores})
      }
      return req({method: 'db', endpoint: 'ignores', post: true, attr}, cb)
    },
    need (folder, cb) {
      let attr = [{key: 'folder', val: folder}]
      return req({method: 'db', endpoint: 'need', attr}, cb)
    },
    prio (folder, file, cb) {
      let attr = [{key: 'folder', val: folder}, {key: 'file', val: file}]
      return req({method: 'db', endpoint: 'prio', post: true, attr}, cb)
    },
  },
  stats: {
    devices: cb => req({method: 'stats', endpoint: 'device'}, cb),
    folders: cb => req({method: 'stats', endpoint: 'folder'}, cb),
  },
  misc: {
    deviceId(id, cb) {
      let attr = [{key: 'id', val: id}]
      return req({method: 'svc', endpoint: 'deviceid', attr}, cb)
    },
    lang: cb => req({method: 'svc', endpoint: 'lang'}, cb),
    report: cb => req({method: 'svc', endpoint: 'report'}, cb),
  },
})

module.exports = syncthing
