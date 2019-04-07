import request from "request";

const encodeAttributes = attr =>
  attr
    .filter(x => x.val)
    .map(({ key, val }) => `${encodeURI(key)}=${encodeURI(val)}`)
    .join("&");

const req = ({
  csrfToken,
  config,
  callback,
  options: {
    method = "system",
    endpoint = "ping",
    post = false,
    body = "",
    attr
  }
}) => {
  const baseURL = `${config.https ? "https" : "http"}://${config.host}:${
    config.port
  }`;

  attr = attr ? `?${encodeAttributes(attr)}` : "";

  endpoint = endpoint ? `/${endpoint}` : "";

  const headers =
    !config.apiKey && csrfToken
      ? {
          [`X-${csrfToken.key}`]: csrfToken.value
        }
      : {
          "X-API-Key": config.apiKey
        };

  let options = {
    method: post ? "POST" : "GET",
    url: `${baseURL}/rest/${method}${endpoint}${attr}`,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    json: true,
    body,
    rejectUnauthorized: false,
    auth: config.username &&
      config.password && {
        user: config.username,
        pass: config.password,
        sendImmediately: true
      }
  };

  request(options, (err, res, body) => {
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
export default function handleReq(config) {
  const authCheck = csrfTokenCheck();

  return function(options, callback) {
    if (callback) {
      authCheck({ config, options, callback });
    } else {
      return new Promise((resolve, reject) => {
        authCheck({
          config,
          options,
          callback: (err, res) => (err ? reject(err) : resolve(res))
        });
      });
    }
  };
}

function csrfTokenCheck() {
  let csrfToken;

  return data => {
    if (
      !data.config.apiKey &&
      data.config.username &&
      data.config.password &&
      !csrfToken
    ) {
      getCsrfToken(data.config, (err, res) => {
        if (!err) {
          csrfToken = res;
          req({ csrfToken, ...data });
        } else {
          data.callback("Authentication error");
        }
      });
    } else {
      req({ csrfToken, ...data });
    }
  };
}

function getCsrfToken(config, callback) {
  const jar = request.jar();

  const url = `${config.https ? "https" : "http"}://${config.host}:${
    config.port
  }`;

  request(
    {
      jar,
      url,
      rejectUnauthorized: false,
      auth: {
        user: config.username,
        pass: config.password,
        sendImmediately: true
      }
    },
    err => {
      if (!err) {
        const cookies = jar.getCookies(url);
        const csrfCookie = cookies.filter(
          ({ key }) => key.indexOf("CSRF-Token-") > -1
        )[0];

        //No CSRF Cookie in response
        if (!csrfCookie) {
          callback("Authentication error");
        } else {
          //Set CSRF token for next requests
          callback(undefined, csrfCookie);
        }
      } else {
        callback(err);
      }
    }
  );
}
