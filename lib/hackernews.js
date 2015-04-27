var FeedParser = require('feedparser');
var request = require('request');

module.exports = function(callback) {
  var url = 'https://news.ycombinator.com/rss';
  var req = request(url);
  var feedparser = new FeedParser();
  var items = [];

  req.on('response', function(res) {
    if (res.statusCode !== 200) return callback(true);
    res.pipe(feedparser);
  });

  req.on('end', function() {
    callback(null, items);
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
};
