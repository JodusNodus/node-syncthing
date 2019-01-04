'use strict'
const NS = require('./')

const test = require('tape')
const tapSpec = require('tap-spec')
test.createStream().pipe(tapSpec()).pipe(process.stdout)

const example = {
  hostname: 'localhost',
  port: 8384,
  apiKey: 'HsyFxJSUVmdukYAYpjAkfWnWVFmb7fr6',
  folder: 'avjdp-tcyxn',
  subdir: 'random-folder',
  file: 'test.txt',
  https: true,
  device: 'BNR2DIW-ZPX3AYS-W4DVSQL-XSD5IU5-BNQO4JI-NDITFJQ-24OPEJO-6SKYCQO',
  eventListener: true
}

const st = NS(example)

test('Callback', function (t) {
  t.plan(2)
  st.system.ping(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(res.ping, 'pong')
  })
})

test('Promises', function (t) {
  t.plan(1)
  st.system.ping().then(function (res) {
    t.equal(res.ping, 'pong')
  }).catch(function (err) {
    t.equal(!err, true, 'No Errors')
  })
})

test('System/Version', function (t) {
  t.plan(2)
  st.system.version(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})

test('System/Status', function (t) {
  t.plan(2)
  st.system.status(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})

test('System/Connections', function (t) {
  t.plan(2)
  st.system.connections(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})

test('System/Config', function (t) {
  t.plan(4)
  st.system.getConfig(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
    st.system.setConfig(res, function (err) {
      t.equal(!err, true, 'No Errors')
      st.system.configInSync(function(err) {
        t.equal(!err, true, 'No Errors')
      })
    })
  })
})

test('System/Debug', function (t) {
  t.plan(2)
  st.system.debug(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})

test('System/Get Discovery', function (t) {
  t.plan(2)
  st.system.getDiscovery(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})

test('System/Errors', function (t) {
  t.plan(2)
  st.system.errors(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})

// test("Clear Errors", function (t) {
//   t.plan(2);
//   st.system.clearErrors(function (err) {
//     t.equal(!err, true, "No Errors");
//   });
// });
test('System/Logs', function (t) {
  t.plan(2)
  st.system.logs(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})

test('System/Pause', function (t) {
  t.plan(1)
  st.system.pause(example.device, function (err) {
    t.equal(!err, true, 'No Errors')
  })
})

test('System/Resume', function (t) {
  t.plan(1)
  st.system.resume(example.device, function (err) {
    t.equal(!err, true, 'No Errors')
  })
})

test('DB/Scan', function (t) {
  t.plan(2)
  st.db.scan(example.folder, function (err) {
    t.equal(!err, true, 'No Errors')
  })
  st.db.scan(example.folder, example.subdir, function (err) {
    t.equal(!err, true, 'No Errors')
  })
})
test('DB/Status', function (t) {
  t.plan(2)
  st.db.status(example.folder, function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})
test('DB/Browse', function (t) {
  t.plan(2)
  st.db.browse(example.folder, 1, example.subdir, function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})
test('DB/File', function (t) {
  t.plan(2)
  st.db.file(example.folder, example.file, function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})
test('DB/Get Ignores', function (t) {
  t.plan(2)
  st.db.getIgnores(example.folder, function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})
test('DB/Override', function (t) {
  t.plan(1)
  st.db.override(example.folder, function (err) {
    t.equal(!err, true, 'No Errors')
  })
})
test('Stats/Devices', function (t) {
  t.plan(2)
  st.stats.devices(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})
test('Stats/Folders', function (t) {
  t.plan(2)
  st.stats.folders(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})
test('Misc/Device ID', function (t) {
  t.plan(2)
  st.misc.deviceId(example.device, function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})
test('Misc/Lang', function (t) {
  t.plan(2)
  st.misc.lang(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
  })
})
test('Misc/RandomString', function (t) {
  t.plan(4)
  const length = 16
  st.misc.randomString(length, function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
    t.equal(typeof res.random, 'string', 'Has random string inside object')
    t.equal(res.random.length, length, 'Random string is correct length')
  })
})

const exampleBasicAuth = Object.assign({}, example)

exampleBasicAuth.apiKey = undefined
exampleBasicAuth.username = 'test'
exampleBasicAuth.password = 'test'

const stBasicAuth = NS(exampleBasicAuth)

test('Basic Authentication', function (t) {
  t.plan(3)
  stBasicAuth.system.getConfig(function (err, res) {
    t.equal(!err, true, 'No Errors')
    t.equal(typeof res, 'object', 'Json response')
    stBasicAuth.system.setConfig(res, function (err) {
      t.equal(!err, true, 'No Errors')
    })
  })
})

test('Events', function (t) {
  setTimeout(() => { 
    st.db.scan(example.folder, (err) => { 
      if(err) console.log(err) 
    })
  }, 250)
  st.once('stateChanged', (data) => {
    t.equal(typeof data, 'object', 'Json response')
    t.end()
  })
})

test.onFinish(() => {
  console.log("\nAll tests ended.\n") 
  process.exit()  
})