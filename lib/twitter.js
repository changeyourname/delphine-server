require('dotenv').load();
var request = require('request');

var url = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
var oauth = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  token: process.env.TWITTER_ACCESS_TOKEN_KEY,
  token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

var items = [];

function parseUrls(text, entities) {
  var html = text;

  entities.hashtags.map(function(el) {
    var find = '#' + el.text;
    var replace = '<a href="https://twitter.com/hashtag/' + el.text + '" target="_blank">' + find + '</a>';
    html = html.replace(find, replace);
  });

  entities.user_mentions.map(function(el) {
    var find = '@' + el.screen_name;
    var replace = '<a href="https://twitter.com/' + el.screen_name + '" target="_blank">' + find + '</a>';
    html = html.replace(find, replace);
  });

  entities.urls.map(function(el) {
    var find = el.url;
    var replace = '<a href="' + find + '" target="_blank">' + el.display_url + '</a>';
    html = html.replace(find, replace);
  });

  if (entities.media) {
    entities.media.map(function(el) {
      var find = el.url;
      var replace = '<img src="' + el.media_url + '"/>';
      html = html.replace(find, '');
      html += replace;
    });
  }

  return html;
}

function parseTweet(tweet) {
  items.push({
    id: tweet.id_str,
    retweet: false,
    html: parseUrls(tweet.text, tweet.entities),
    date: tweet.created_at,
    user: {
      name: tweet.user.name,
      screenName: tweet.user.screen_name,
      avatar: tweet.user.profile_image_url.replace('_normal', '_bigger')
    }
  });
}

function parseRetweet(tweet) {
  items.push({
    id: tweet.id_str,
    retweet: true,
    html: parseUrls(tweet.retweeted_status.text, tweet.entities),
    date: tweet.retweeted_status.created_at,
    user: {
      name: tweet.user.name,
      screenName: tweet.user.screen_name
    },
    retweetUser: {
      name: tweet.retweeted_status.user.name,
      screenName: tweet.retweeted_status.user.screen_name,
      avatar: tweet.retweeted_status.user.profile_image_url.replace('_normal', '_bigger')
    }
  });
}

module.exports = function(callback) {
  request({url: url, oauth: oauth}, function(err, res, body) {
    if (err || res.statusCode !== 200) return callback(true);

    var json = JSON.parse(body);
    for (var i = 0; i < json.length; i++) {
      if (json[i].retweeted_status) {
        parseRetweet(json[i]);
      } else {
        parseTweet(json[i]);
      }
    }

    callback(null, items);
  });
};
