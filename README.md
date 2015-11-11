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

Endpoint:
* System
* Database
* Statistics
* Misc

Action:
* ex. ping

- - -
