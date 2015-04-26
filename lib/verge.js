var FeedParser = require('feedparser');
var cheerio = require('cheerio');
var request = require('request');

module.exports = function(callback) {
  var url = 'http://www.theverge.com/rss/frontpage';
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
      $ = cheerio.load(item.description);

      items.push({
        date: item.date,
        image: $('img').attr('src'),
        title: item.title,
        url: item.link
      });
    }
  });
};
