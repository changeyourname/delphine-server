var request = require('request');
var redis = require('./redis');

var url = 'https://www.reddit.com/.json?feed=5a2dfc3a384a4a5278bded2fb6438923d708edc8&user=foxwell_750';
var key = 'reddit';

function getData(callback) {
  var items = [];

  request(url, function(err, res, body) {
    if (err || res.statusCode !== 200) return callback(true);

    var json = JSON.parse(body);
    json.data.children.forEach(function(el) {
      if (el.data.is_self) return false;

      items.push({
        id: el.data.id,
        domain: el.data.domain,
        subreddit: el.data.subreddit,
        thumbnail: el.data.thumbnail,
        title: el.data.title,
        url: el.data.url
      });
    });

    redis.set(key, items, function() {
      callback(null, items);
    });
  });
}

module.exports = function(callback) {
  redis.get(key, function(data) {
    if (data) return callback(null, data);

    getData(function(err, items) {
      if (err) return callback(true);
      callback(null, items);
    });
  });
};
