var request = require('request');

module.exports = function(url, callback) {
  request.get(url, function(err, res, body) {
    if (err) return callback(err);

    callback(null, body);
  });
};
