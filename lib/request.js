'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = handleReq;

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
  var csrfToken = _ref2.csrfToken;
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

  var baseURL = (config.https ? 'https' : 'http') + '://' + config.host + ':' + config.port;

  attr = attr ? '?' + encodeAttributes(attr) : '';

  endpoint = endpoint ? '/' + endpoint : '';

  var headers = !config.apiKey && csrfToken ? _defineProperty({}, 'X-' + csrfToken.key, csrfToken.value) : {
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

//Wrap in a promise if expected
function handleReq(config) {
  var authCheck = csrfTokenCheck();

  return function (options, callback) {
    if (callback) {
      authCheck({ config: config, options: options, callback: callback });
    } else {
      return new Promise(function (resolve, reject) {
        authCheck({
          config: config,
          options: options,
          callback: function callback(err, res) {
            return err ? reject(err) : resolve(res);
          }
        });
      });
    }
  };
}

function csrfTokenCheck() {
  var csrfToken = undefined;

  return function (data) {
    if (!data.config.apiKey && data.config.username && data.config.password && !csrfToken) {
      getCsrfToken(data.config, function (err, res) {
        if (!err) {
          csrfToken = res;
          req(_extends({ csrfToken: csrfToken }, data));
        } else {
          data.callback('Authentication error');
        }
      });
    } else {
      req(_extends({ csrfToken: csrfToken }, data));
    }
  };
}

function getCsrfToken(config, callback) {
  var jar = _request2.default.jar();

  var url = (config.https ? 'https' : 'http') + '://' + config.host + ':' + config.port;

  (0, _request2.default)({
    jar: jar,
    url: url,
    rejectUnauthorized: false,
    auth: {
      user: config.username,
      pass: config.password,
      sendImmediately: true
    }
  }, function (err) {
    if (!err) {
      var cookies = jar.getCookies(url);
      var csrfCookie = cookies.filter(function (_ref4) {
        var key = _ref4.key;
        return key.indexOf('CSRF-Token-') > -1;
      })[0];

      //No CSRF Cookie in response
      if (!csrfCookie) {
        callback('Authentication error');
      } else {
        //Set CSRF token for next requests
        callback(undefined, csrfCookie);
      }
    } else {
      callback(err);
    }
  });
}