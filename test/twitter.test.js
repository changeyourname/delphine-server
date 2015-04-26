var expect = require('chai').expect;
var nock = require('nock');
var path = require('path');

var twitter = require('../lib/twitter');

describe('twitter', function() {
  describe('200 OK', function() {
    beforeEach(function() {
      nock('https://api.twitter.com')
        .get('/1.1/statuses/home_timeline.json')
        .replyWithFile(200, path.join(__dirname, '/replies/twitter.json'));
    });

    it('should have the correct item count', function(done) {
      twitter(function(err, items) {
        expect(items).to.have.length(18);
        done();
      });
    });

    it('should have the necessary keys', function(done) {
      twitter(function(err, items) {
        expect(items[0]).to.contain.all.keys(['id', 'retweet', 'html', 'date', 'user']);
        expect(items[2]).to.contain.all.keys(['retweetUser']);
        done();
      });
    });

    it('should not return undefined values', function(done) {
      twitter(function(err, items) {
        expect(items[0].id).to.not.be.undefined;
        expect(items[0].retweet).to.not.be.undefined;
        expect(items[0].html).to.not.be.undefined;
        expect(items[0].date).to.not.be.undefined;
        expect(items[0].user).to.not.be.undefined;
        expect(items[2].retweetUser).to.not.be.undefined;
        done();
      });
    });

    it('should have the necessary keys on user', function(done) {
      twitter(function(err, items) {
        expect(items[0].user).to.have.all.keys(['name', 'screenName', 'avatar']);
        expect(items[2].user).to.have.all.keys(['name', 'screenName']);
        expect(items[2].retweetUser).to.have.all.keys(['name', 'screenName', 'avatar']);
        done();
      });
    });
  });

  describe('404 Not Found', function() {
    it('should return 404 when page not found', function(done) {
      nock('https://api.twitter.com')
        .get('/1.1/statuses/home_timeline.json')
        .reply(404, null);

      twitter(function(err, items) {
        expect(err).to.be.true;
        expect(items).to.be.empty;
        done();
      });
    });
  });
});
