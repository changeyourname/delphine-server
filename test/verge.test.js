var expect = require('chai').expect;
var nock = require('nock');
var path = require('path');

var redis = require('redis');
var client = redis.createClient();

var verge = require('../lib/verge');

describe('verge', function() {
  afterEach(function(done) {
    client.flushdb(function() {
      done();
    });
  });

  describe('200 OK', function() {
    beforeEach(function() {
      nock.cleanAll();
      nock('http://www.theverge.com')
        .get('/rss/frontpage')
        .replyWithFile(200, path.join(__dirname, '/replies/verge.xml'));
    });

    it('should have the correct item count', function(done) {
      verge(function(err, items) {
        expect(items).to.have.length(10);
        done();
      });
    });

    it('should have only the necessary keys', function(done) {
      verge(function(err, items) {
        expect(items[0]).to.have.all.keys(['date', 'image', 'title', 'url']);
        done();
      });
    });

    it('should not return undefined values', function(done) {
      verge(function(err, items) {
        expect(items[0].date).to.not.be.undefined;
        expect(items[0].image).to.not.be.undefined;
        expect(items[0].title).to.not.be.undefined;
        expect(items[0].url).to.not.be.undefined;
        done();
      });
    });

    it('should return data from redis', function(done) {
      client.set('verge', JSON.stringify([{ date: '2015-04-25T18:24:01.000Z', image: 'https://cdn0.vox-cdn.com/thumbor/WVhpJK8FkF5wBdWlQOlarAsr9fo=/54x0:505x301/800x536/cdn0.vox-cdn.com/uploads/chorus_image/image/46211324/tony-hawks-pro-skater-hd-features-at-least-seven-levels-from-first-two-games__560px.0.jpeg', title: 'Tony Hawk shares a cheeky video of a Pro Skater character in real life', url: 'http://www.theverge.com/2015/4/25/8496119/tony-hawk-pro-skater-character-menu-joke' }]), function() {
        verge(function(err, items) {
          expect(items[0]).to.have.all.keys(['date', 'image', 'title', 'url']);
          expect(items[0].date).to.equal('2015-04-25T18:24:01.000Z');
          expect(items[0].image).to.equal('https://cdn0.vox-cdn.com/thumbor/WVhpJK8FkF5wBdWlQOlarAsr9fo=/54x0:505x301/800x536/cdn0.vox-cdn.com/uploads/chorus_image/image/46211324/tony-hawks-pro-skater-hd-features-at-least-seven-levels-from-first-two-games__560px.0.jpeg');
          expect(items[0].title).to.equal('Tony Hawk shares a cheeky video of a Pro Skater character in real life');
          expect(items[0].url).to.equal('http://www.theverge.com/2015/4/25/8496119/tony-hawk-pro-skater-character-menu-joke');
          done();
        });
      });
    });
  });

  describe('404 Not Found', function() {
    beforeEach(function() {
      nock.cleanAll();
      nock('http://www.theverge.com')
        .get('/rss/frontpage')
        .reply(404, null);
    });

    it('should return 404 when page not found', function(done) {
      verge(function(err, items) {
        expect(err).to.be.true;
        expect(items).to.be.empty;
        done();
      });
    });
  });
});
