var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL || 'redis://:@localhost:6379');
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(':')[1]);

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
