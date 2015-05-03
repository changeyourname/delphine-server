var expect = require('chai').expect;
var nock = require('nock');
var path = require('path');

var redis = require('redis');
var client = redis.createClient();

var twitter = require('../lib/twitter');

describe('twitter', function() {
  afterEach(function(done) {
    client.flushdb(function() {
      done();
    });
  });

  describe('200 OK', function() {
    beforeEach(function() {
      nock.cleanAll();
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

    it('should return data from redis', function(done) {
      client.set('twitter', JSON.stringify([{ id: '592316783438225408', retweet: false, html: 'China wil alle burgers een cijfer geven op basis van Big Data. Is dit voor jou over de grens? En zo ja, waarom? <a href="http://t.co/aWFxVlVtJ6" target="_blank">volkskrant.nl/buitenland/chi…</a>', date: 'Sun Apr 26 13:18:20 +0000 2015', user: { name: 'Bits of Freedom', screenName: 'bitsoffreedom', avatar: 'http://pbs.twimg.com/profile_images/1581450318/logo_rgb_jptwitter_bigger.png' } }]), function() {
        twitter(function(err, items) {
          expect(items[0]).to.have.all.keys(['id', 'retweet', 'html', 'date', 'user']);
          expect(items[0].id).to.equal('592316783438225408');
          expect(items[0].retweet).to.be.false;
          expect(items[0].html).to.equal('China wil alle burgers een cijfer geven op basis van Big Data. Is dit voor jou over de grens? En zo ja, waarom? <a href="http://t.co/aWFxVlVtJ6" target="_blank">volkskrant.nl/buitenland/chi…</a>');
          expect(items[0].date).to.equal('Sun Apr 26 13:18:20 +0000 2015');
          expect(items[0].user).to.have.all.keys(['name', 'screenName', 'avatar']);
          done();
        });
      });
    });
  });

  describe('404 Not Found', function() {
    beforeEach(function() {
      nock.cleanAll();
      nock('https://api.twitter.com')
        .get('/1.1/statuses/home_timeline.json')
        .reply(404, null);
    });

    it('should return 404 when page not found', function(done) {
      twitter(function(err, items) {
        expect(err).to.be.true;
        expect(items).to.be.empty;
        done();
      });
    });
  });
});
