# Node Syncthing
Lightweight asynchronous [Syncthing](http://syncthing.net/) integration for nodejs.

## Install:
`npm install node-syncthing --save`
## Usage:
`var syncthing = require('node-syncthing');`

#### 1. Initiate connection
`syncthing.init(options, callback);`

Options: _object_
* hostname: **domain** or **ip address** _(defaults to 'localhost')_
* port: **port number** _(defaults to '8384')_
* apikey: **full API key**

Callback: _function_
* Function containing a single argument which returns __true__ or __false__ depending on the success of the initiation.

- - -
#### 2. Actions
`syncthing.endpoint.action(options, callback);`

example: `syncthing.db.status( folder, callback );`

Information about options: [Syncthing API](http://docs.syncthing.net/dev/rest.html)

Endpoints: _endpoint/actions (options)_
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
  - browse _(folder, levels, subdir) subdir comes behind callback!_
  - completion _(device, folder)_
  - file _(folder, file)_
  - getIgnores
  - setIgnores _(folder, ignores)_
  - need _(folder)_
  - prio _(folder, file)_
* Statistics _(stats)_
  - devices
  - folders
* Misc _(misc)_
  - folders _(device)_
  - lang
  - report

The actions return a callback containing:
* Error argument _(returns the error or null if there was none)_
* Data argument _(api response)_

- - -
