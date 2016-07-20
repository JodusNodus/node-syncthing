'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var csrfToken = {};

var encodeAttributes = function encodeAttributes(attr) {
  return attr.filter(function (x) {
    return x.val;
  }).map(function (_ref) {
    var key = _ref.key;
    var val = _ref.val;
    return encodeURI(key) + '=' + encodeURI(val);
  }).join('&');
};

var req = function req(_ref2) {
  var config = _ref2.config;
  var callback = _ref2.callback;
  var _ref2$options = _ref2.options;
  var _ref2$options$method = _ref2$options.method;
  var method = _ref2$options$method === undefined ? 'system' : _ref2$options$method;
  var _ref2$options$endpoin = _ref2$options.endpoint;
  var endpoint = _ref2$options$endpoin === undefined ? 'ping' : _ref2$options$endpoin;
  var _ref2$options$post = _ref2$options.post;
  var post = _ref2$options$post === undefined ? false : _ref2$options$post;
  var _ref2$options$body = _ref2$options.body;
  var body = _ref2$options$body === undefined ? '' : _ref2$options$body;
  var attr = _ref2$options.attr;

  var baseURL = (config.https ? 'https' : 'http') + '://' + config.hostname + ':' + config.port;

  //The actual request...
  var requestFactory = function requestFactory() {
    attr = attr ? encodeAttributes(attr) : '';

    endpoint = endpoint ? '/' + endpoint : '';

    var headers = csrfToken.value ? _defineProperty({}, 'X-' + csrfToken.key, csrfToken.value) : {
      'X-API-Key': config.apiKey
    };

    var options = {
      method: post ? 'POST' : 'GET',
      url: baseURL + '/rest/' + method + endpoint + attr,
      headers: _extends({
        'Content-Type': 'application/json'
      }, headers),
      json: true,
      body: body,
      rejectUnauthorized: false,
      auth: config.username && config.password && {
        user: config.username,
        pass: config.password,
        sendImmediately: true
      }
    };

    (0, _request2.default)(options, function (err, res, body) {
      if (!err && res.statusCode == 200) {
        try {
          body = JSON.parse(body);
        } catch (e) {
          //Not parsable
        }
        callback(err, body);
      } else {
        callback(err || body);
      }
    });
  };

  //Get CSRF Token for basic auth authentication
  if (config.username && config.password && !csrfToken.value) {
    (function () {
      var jar = _request2.default.jar();

      (0, _request2.default)({
        jar: jar,
        rejectUnauthorized: false,
        url: baseURL,
        'auth': {
          'user': config.username,
          'pass': config.password,
          'sendImmediately': true
        }
      }, function (err) {
        if (!err) {
          var cookies = jar.getCookies(baseURL);
          var csrfCookie = cookies.filter(function (_ref4) {
            var key = _ref4.key;
            return key.indexOf('CSRF-Token-') > -1;
          })[0];

          //No CSRF Cookie in response
          if (!csrfCookie) {
            callback('Authentication error');
          } else {
            //Set CSRF token for next requests
            csrfToken = csrfCookie;

            //Call actual request
            requestFactory();
          }
        } else {
          callback('Authentication error');
        }
      });
    })();
  } else {
    //Call actual request
    requestFactory();
  }
};

//Wrap in a promise if expected
var reqWrapper = function reqWrapper(config) {
  return function (options, callback) {
    if (callback) {
      req({ config: config, options: options, callback: callback });
    } else {
      return new Promise(function (resolve, reject) {
        req({
          config: config,
          options: options,
          callback: function callback(err, res) {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          }
        });
      });
    }
  };
};

exports.default = reqWrapper;