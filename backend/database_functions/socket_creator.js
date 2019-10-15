module.exports = require("socket.io-client")("http://localhost:8888/", {
  query: { connectionType: "d" }
});
