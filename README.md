## Install:
`npm i node-syncthing --save`
## Usage:
```
var NS = require('node-syncthing');
var syncthing = new NS(options);
```

Options: _object_
* hostname: **domain** or **ip address** _(defaults to localhost)_
* port: **port number** _(defaults to 8384)_
* apiKey: **full API key** _(not necessary for non authenticated requests)_

### Methods
Using callbacks: `syncthing.endpoint.method(options, callback);`

Using promises: `syncthing.endpoint.method(options).then(responseHandler).catch(errorHandler);`

Information about options: [Syncthing API](http://docs.syncthing.net/dev/rest.html)

Endpoints: _endpoint/method (options)_
* System _(system)_
  - ping
  - shutdown
  - restart
  - version
  - status
  - connections
  - getConfig
  - setConfig _(config)_
  - debug
  - getDiscovery
  - setDiscovery _(device, address)_
  - errors
  - clearErrors
  - logs
  - getUpgrade
  - setUpgrade
* Database _(db)_
  - scan _(folder)_
  - status _(folder)_
  - browse _(folder, levels, optionally a subdir)_
  - completion _(device, folder)_
  - file _(folder, file)_
  - getIgnores
  - setIgnores _(folder, optionally ignores)_
  - need _(folder)_
  - prio _(folder, file)_
* Statistics _(stats)_
  - devices
  - folders
* Misc _(misc)_
  - folders _(device)_
  - lang
  - report

Data and errors can be handled with callbacks or with promises:
* Promises _(Provide no callback function)_
* Callback _(Provide a callback function as the last argument in the method)_
  - Error argument _(returns the error or null if there was none)_
  - Data argument _(api response)_

## Example:
```
var NS = require('./index.js');
//Options
var options = {
  hostname: "localhost",
  port: 8384,
  apiKey: "abc123"
};
const st = new NS(options);
//With Callback
st.system.ping(function (err, res) {
  if (!err) {
    console.log(res.ping); //pong
  }else {
    console.log(err);
  }
});
//With Promises
st.system.ping().then(function (res) {
  console.log(res.ping); //pong
}).catch(function (err) {
  console.log(err);
});
```

## Dev

### Build

`npm i`

`npm run build`

### Test

`npm test`
