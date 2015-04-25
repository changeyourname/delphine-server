var expect = require('chai').expect;
var nock = require('nock');
var path = require('path');

var reddit = require('../lib/reddit');

describe('reddit', function() {
  describe('200 OK', function() {
    beforeEach(function() {
      nock('https://www.reddit.com')
        .get('/.json?feed=some_random_id')
        .replyWithFile(200, path.join(__dirname, '/replies/reddit.json'));
    });

    it('should have the correct item count', function(done) {
      reddit('https://www.reddit.com/.json?feed=some_random_id', function(err, items) {
        expect(items).to.have.length(24);
        done();
      });
    });

    it('should have only the necessary keys', function(done) {
      reddit('https://www.reddit.com/.json?feed=some_random_id', function(err, items) {
        expect(items[0]).to.have.all.keys(['id', 'domain', 'subreddit', 'thumbnail', 'title', 'url']);
        done();
      });
    });

    it('should not return undefined values', function(done) {
      reddit('https://www.reddit.com/.json?feed=some_random_id', function(err, items) {
        expect(items[0].id).to.not.be.undefined;
        expect(items[0].domain).to.not.be.undefined;
        expect(items[0].subreddit).to.not.be.undefined;
        expect(items[0].thumbnail).to.not.be.undefined;
        expect(items[0].title).to.not.be.undefined;
        expect(items[0].url).to.not.be.undefined;
        done();
      });
    });
  });

  describe('404 Not Found', function() {
    it('should return 404 when page not found', function(done) {
      nock('https://www.reddit.com')
        .get('/.json?feed=some_random_id')
        .reply(404, null);

      reddit('https://www.reddit.com/.json?feed=some_random_id', function(err, items) {
        expect(err).to.be.true;
        expect(items).to.be.empty;
        done();
      });
    });
  });

});
