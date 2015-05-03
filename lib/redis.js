var redis = require('redis');
var client = redis.createClient();

module.exports = {
  get: function(key, callback) {
    client.get(key, function(err, data) {
      if (err || !data) return callback(false);

      return callback(JSON.parse(data));
    });
  },

  set: function(key, data, callback) {
    client.setex(key, 1800, JSON.stringify(data));
    callback();
  }
};
