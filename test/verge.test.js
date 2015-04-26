var expect = require('chai').expect;
var nock = require('nock');
var path = require('path');

var verge = require('../lib/verge');

describe('verge', function() {
  describe('200 OK', function() {
    beforeEach(function() {
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
  });

  describe('404 Not Found', function() {
    it('should return 404 when page not found', function(done) {
      nock('http://www.theverge.com')
        .get('/rss/frontpage')
        .reply(404, null);

      verge(function(err, items) {
        expect(err).to.be.true;
        expect(items).to.be.empty;
        done();
      });
    });
  });
});
