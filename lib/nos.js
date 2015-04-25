var FeedParser = require('feedparser');
var request = require('request');

module.exports = function(callback) {
  var url = 'http://feeds.feedburner.com/nosnieuwsalgemeen';
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
        date: item.date,
        image: item.enclosures[0].url,
        title: item.title,
        url: item.link
      });
    }
  });
};
