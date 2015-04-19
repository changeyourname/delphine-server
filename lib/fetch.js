var request = require('request');

module.exports = function(url, callback) {
  request.get(url, function(err, res, body) {
    if (!err && res.statusCode === 200) {
      callback(null, body);
    } else {
      callback(err);
    }
  });
};
