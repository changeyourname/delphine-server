var expect = require('chai').expect;
var nock = require('nock');
var path = require('path');

var hackernews = require('../lib/hackernews');

describe('hackernews', function() {
  describe('200 OK', function() {
    beforeEach(function() {
      nock('https://news.ycombinator.com')
        .get('/rss')
        .replyWithFile(200, path.join(__dirname, '/replies/hackernews.xml'));
    });

    it('should have the correct item count', function(done) {
      hackernews(function(err, items) {
        expect(items).to.have.length(30);
        done();
      });
    });

    it('should have only the necessary keys', function(done) {
      hackernews(function(err, items) {
        expect(items[0]).to.have.all.keys(['commentsUrl', 'title', 'url']);
        done();
      });
    });

    it('should not return undefined values', function(done) {
      hackernews(function(err, items) {
        expect(items[0].commentsUrl).to.not.be.undefined;
        expect(items[0].title).to.not.be.undefined;
        expect(items[0].url).to.not.be.undefined;
        done();
      });
    });
  });

  describe('404 Not Found', function() {
    it('should return 404 when page not found', function(done) {
      nock('https://news.ycombinator.com')
        .get('/rss')
        .reply(404, null);

      hackernews(function(err, items) {
        expect(err).to.be.true;
        expect(items).to.be.empty;
        done();
      });
    });
  });
});
