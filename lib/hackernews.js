var FeedParser = require('feedparser');
var request = require('request');
var redis = require('./redis');

var key = 'hackernews';

function getData(callback) {
  var url = 'https://news.ycombinator.com/rss';
  var req = request(url);
  var feedparser = new FeedParser();
  var items = [];

  req.on('response', function(res) {
    if (res.statusCode !== 200) return callback(true);
    res.pipe(feedparser);
  });

  req.on('end', function() {
    if (items.length > 0) {
      redis.set(key, items, function() {
        callback(null, items);
      });
    }
  });

  feedparser.on('readable', function() {
    var item;
    while (item = this.read()) {
      items.push({
        commentsUrl: item.comments,
        title: item.title,
        url: item.link
      });
    }
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
