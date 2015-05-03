var async = require('async');

var hackernews = require('./hackernews');
var nos = require('./nos');
var reddit = require('./reddit');
var twitter = require('./twitter');
var verge = require('./verge');

module.exports = function(callback) {
  async.parallel({
    hackernews: hackernews,
    nos: nos,
    reddit: reddit,
    twitter: twitter,
    verge: verge
  }, function(err, results) {
    if (err) return callback(true);
    return callback(null, results);
  });
};



