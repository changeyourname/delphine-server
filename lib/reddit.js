var request = require('request');

module.exports = function(url, callback) {
  var items = [];

  request(url, function(err, res, body) {
    if (res.statusCode !== 200) return callback(true);

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

    callback(null, items);
  });
};
