require('dotenv').load();
var expect = require('chai').expect;
var nock = require('nock');
var path = require('path');
var url = require('url');

var redis = require('redis');
var client = redis.createClient();

var reddit = require('../lib/reddit');
var redditURL = url.parse(process.env.REDDIT_URL);

describe('reddit', function() {
  afterEach(function(done) {
    client.flushdb(function() {
      done();
    });
  });

  describe('200 OK', function() {
    beforeEach(function() {
      nock.cleanAll();
      nock(redditURL.protocol + '//' + redditURL.host)
        .get(redditURL.pathname + redditURL.search)
        .replyWithFile(200, path.join(__dirname, '/replies/reddit.json'));
    });

    it('should have the correct item count', function(done) {
      reddit(function(err, items) {
        expect(items).to.have.length(24);
        done();
      });
    });

    it('should have only the necessary keys', function(done) {
      reddit(function(err, items) {
        expect(items[0]).to.have.all.keys(['id', 'domain', 'subreddit', 'thumbnail', 'title', 'url']);
        done();
      });
    });

    it('should not return undefined values', function(done) {
      reddit(function(err, items) {
        expect(items[0].id).to.not.be.undefined;
        expect(items[0].domain).to.not.be.undefined;
        expect(items[0].subreddit).to.not.be.undefined;
        expect(items[0].thumbnail).to.not.be.undefined;
        expect(items[0].title).to.not.be.undefined;
        expect(items[0].url).to.not.be.undefined;
        done();
      });
    });

    it('should return data from redis', function(done) {
      client.set('reddit', JSON.stringify([{ id: '33tgeb', domain: 'i.imgur.com', subreddit: 'pics', thumbnail: 'http://a.thumbs.redditmedia.com/l25TyZXPMIThqIizldYvh4oYJyKCw0AEcQFrJBLCCS4.jpg', title: 'Oh. You\'re home early.', url: 'http://i.imgur.com/Lab4Ray.jpg' }]), function() {
        reddit(function(err, items) {
          expect(items[0]).to.have.all.keys(['id', 'domain', 'subreddit', 'thumbnail', 'title', 'url']);
          expect(items[0].id).to.equal('33tgeb');
          expect(items[0].domain).to.equal('i.imgur.com');
          expect(items[0].subreddit).to.equal('pics');
          expect(items[0].thumbnail).to.equal('http://a.thumbs.redditmedia.com/l25TyZXPMIThqIizldYvh4oYJyKCw0AEcQFrJBLCCS4.jpg');
          expect(items[0].title).to.equal('Oh. You\'re home early.');
          expect(items[0].url).to.equal('http://i.imgur.com/Lab4Ray.jpg');
          done();
        });
      });
    });
  });

  describe('404 Not Found', function() {
    beforeEach(function() {
      nock.cleanAll();
      nock(redditURL.protocol + '//' + redditURL.host)
        .get(redditURL.pathname + redditURL.search)
        .reply(404, null);
    });

    it('should return 404 when page not found', function(done) {
      reddit(function(err, items) {
        expect(err).to.be.true;
        expect(items).to.be.empty;
        done();
      });
    });
  });

});
