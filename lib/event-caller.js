'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = eventCaller;
var lowerCaseFirst = function lowerCaseFirst(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

function eventCaller(req, retries) {
  var _this = this;

  var tries = 0;

  //Event request loop
  var iterator = function iterator(since) {

    var attr = [{ key: 'since', val: since }];

    req({ method: 'events', endpoint: false, attr: attr }).then(function (eventArr) {

      //Check for event count on first request iteration
      if (since != 0) {
        eventArr.forEach(function (e) {
          _this.emit(lowerCaseFirst(e.type), e.data);
        });
      }

      //Update event count
      since = eventArr[eventArr.length - 1].id;

      //Reset tries
      tries = 0;

      setTimeout(function () {
        return iterator(since);
      }, 100);
    }).catch(function (err) {
      _this.emit('error', err);

      //Try to regain connection & reset event counter
      if (tries < retries) {
        tries++;
        setTimeout(function () {
          return iterator(0);
        }, 500);
      }
    });
  };

  iterator(0);
}