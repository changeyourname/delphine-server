var fetch = require('./fetch');

module.exports = function(url, callback) {
  fetch(url, function(err, res) {
    if (!err && res) {
      var json = JSON.parse(res);
      var items = [];
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
    } else {
      callback(true);
    }
  });
};
