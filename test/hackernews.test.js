var expect = require('chai').expect;
var nock = require('nock');
var path = require('path');

var redis = require('redis');
var client = redis.createClient();

var hackernews = require('../lib/hackernews');

describe('hackernews', function() {
  afterEach(function(done) {
    client.flushdb(function() {
      done();
    });
  });

  describe('200 OK', function() {
    beforeEach(function() {
      nock.cleanAll();
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

    it('should return data from redis', function(done) {
      client.set('hackernews', JSON.stringify([{'commentsUrl': 'https://news.ycombinator.com/item?id=9442254', 'title': 'Docker without Docker', 'url': 'https://chimeracoder.github.io/docker-without-docker/#1'}]), function() {
        hackernews(function(err, items) {
          expect(items[0]).to.have.all.keys(['commentsUrl', 'title', 'url']);
          expect(items[0].commentsUrl).to.equal('https://news.ycombinator.com/item?id=9442254');
          expect(items[0].title).to.equal('Docker without Docker');
          expect(items[0].url).to.equal('https://chimeracoder.github.io/docker-without-docker/#1');
          done();
        });
      });
    });
  });

  describe('404 Not Found', function() {
    beforeEach(function() {
      nock.cleanAll();
      nock('https://news.ycombinator.com')
        .get('/rss')
        .reply(404);
    });

    it('should return 404 when page not found', function(done) {
      hackernews(function(err, items) {
        expect(err).to.be.true;
        expect(items).to.be.empty;
        done();
      });
    });
  });
});
