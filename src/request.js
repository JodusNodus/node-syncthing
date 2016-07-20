import request from 'request'

let csrfToken = {}

const encodeAttributes = attr => attr
  .filter(x => x.val)
  .map(({key, val}) => `${encodeURI(key)}=${encodeURI(val)}`)
  .join('&')

const req = ({
  config,
  callback,
  options: {
    method='system',
    endpoint='ping',
    post=false,
    body='',
    attr,
  },
}) => {

  const baseURL = `${config.https ? 'https' : 'http'}://${config.hostname}:${config.port}`

  //The actual request...
  const requestFactory = () => {
    attr = attr ? encodeAttributes(attr) : ''

    endpoint = endpoint ? `/${endpoint}` : ''

    const headers = csrfToken.value ? {
      [`X-${csrfToken.key}`]: csrfToken.value,
    } : {
      'X-API-Key': config.apiKey,
    }

    let options = {
      method: post ? 'POST' : 'GET',
      url: `${baseURL}/rest/${method}${endpoint}${attr}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      json: true,
      body,
      rejectUnauthorized: false,
      auth: (config.username && config.password) && {
        user: config.username,
        pass: config.password,
        sendImmediately: true,
      },
    }

    request(options, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        try {
          body = JSON.parse(body)
        } catch (e) {
          //Not parsable
        }
        callback(err, body)
      }else {
        callback(err || body)
      }
    })
  }

  //Get CSRF Token for basic auth authentication
  if(config.username && config.password && !csrfToken.value){
    const jar = request.jar()

    request({
      jar,
      rejectUnauthorized: false,
      url: baseURL,
      'auth': {
        'user': config.username,
        'pass': config.password,
        'sendImmediately': true,
      },
    }, (err) => {
      if(!err){
        const cookies = jar.getCookies(baseURL)
        const csrfCookie = cookies.filter(({key}) => key.indexOf('CSRF-Token-') > -1)[0]

        //No CSRF Cookie in response
        if(!csrfCookie){
          callback('Authentication error')
        }else{
          //Set CSRF token for next requests
          csrfToken = csrfCookie

          //Call actual request
          requestFactory()
        }
      }else{
        callback('Authentication error')
      }
    })

  }else{
    //Call actual request
    requestFactory()
  }
}

//Wrap in a promise if expected
const reqWrapper = (config) => (options, callback) => {
  if(callback){
    req({config, options, callback})
  }else {
    return new Promise((resolve, reject) => {
      req({
        config,
        options,
        callback: (err, res) => {
          if(err){
            reject(err)
          }else{
            resolve(res)
          }
        },
      })
    })
  }
}

export default reqWrapper
