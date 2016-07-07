var NS = require('./index.js');
//Options
var options = {
  hostname: "localhost",
  port: 8384,
  apiKey: "abc123",
  eventListener: true,
  username: 'test',
  password: 'abc123'
};
const st = new NS(options);
//Listen for stateChanged event
st.on("stateChanged", function (data) {
  console.log(data)
})
//With Callback
st.system.ping(function (err, res) {
  if (!err) {
    console.log(res.ping);
  }else {
    console.log(err);
  }
});
//With Promises
st.system.ping().then(function (res) {
  console.log(res.ping);
}).catch(function (err) {
  console.log(err);
});
