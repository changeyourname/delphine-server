var expect = require('chai').expect;
var nock = require('nock');
var path = require('path');

var redis = require('redis');
var client = redis.createClient();

var nos = require('../lib/nos');

describe('nos', function() {
  afterEach(function(done) {
    client.flushdb(function() {
      done();
    });
  });

  describe('200 OK', function() {
    beforeEach(function() {
      nock.cleanAll();
      nock('http://feeds.feedburner.com')
        .get('/nosnieuwsalgemeen')
        .replyWithFile(200, path.join(__dirname, '/replies/nos.xml'));
    });

    it('should have the correct item count', function(done) {
      nos(function(err, items) {
        expect(items).to.have.length(20);
        done();
      });
    });

    it('should have only the necessary keys', function(done) {
      nos(function(err, items) {
        expect(items[0]).to.have.all.keys(['date', 'image', 'title', 'url']);
        expect(items[0].date).to.not.be.undefined;
        expect(items[0].image).to.not.be.undefined;
        expect(items[0].title).to.not.be.undefined;
        expect(items[0].url).to.not.be.undefined;
        done();
      });
    });

    it('should return data from redis', function(done) {
      client.set('nos', JSON.stringify([{'date': '2015-04-25T15:52:33.000Z', 'image': 'http://content.nos.nl/data/image/l/2015/04/25/787555.jpg', 'title': 'Microbiologen lauweren Artsen zonder Grenzen', 'url': 'http://nos.nl/l/787556'}]), function() {
        nos(function(err, items) {
          expect(items[0]).to.have.all.keys(['date', 'image', 'title', 'url']);
          expect(items[0].date).to.equal('2015-04-25T15:52:33.000Z');
          expect(items[0].image).to.equal('http://content.nos.nl/data/image/l/2015/04/25/787555.jpg');
          expect(items[0].title).to.equal('Microbiologen lauweren Artsen zonder Grenzen');
          expect(items[0].url).to.equal('http://nos.nl/l/787556');
          done();
        });
      });
    });
  });

  describe('404 Not Found', function() {
    beforeEach(function() {
      nock.cleanAll();
      nock('http://feeds.feedburner.com')
        .get('/nosnieuwsalgemeen')
        .reply(404);
    });

    it('should return 404 when page not found', function(done) {
      nos(function(err, items) {
        expect(err).to.be.true;
        expect(items).to.be.empty;
        done();
      });
    });
  });

});
