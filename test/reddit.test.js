var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');

var reddit = require('../lib/reddit');

describe('reddit', function() {
  afterEach(function(done) {
    request.get.restore();
    done();
  });

  describe('200 OK', function() {
    beforeEach(function(done) {
      sinon
        .stub(request, 'get')
        .yields(null, { statusCode: 200 }, JSON.stringify({
          data: {
            children: [
              {
                data: {
                  id: '1234',
                  author: 'foobar',
                  domain: 'awesome.domain.com',
                  is_self: false,
                  subreddit: 'subreddit',
                  thumbnail: 'http://awesome.thumbnail.com/',
                  title: 'title',
                  url: 'http://awesome.url.com/'
                }
              },
              {
                data: {
                  is_self: true
                }
              }
            ]
          }
        }));
      done();
    });

    it('should call request & have the correct count', function(done) {
      reddit('https://feed.reddit.com/', function(err, items) {
        expect(request.get.called).to.be.true;
        expect(items).to.have.length(1);
        done();
      });
    });

    it('should have only the necessary keys', function(done) {
      reddit('https://feed.reddit.com/', function(err, items) {
        expect(items[0]).to.have.all.keys(['id', 'domain', 'subreddit', 'thumbnail', 'title', 'url']);
        done();
      });
    });

    it('should have the correct values', function(done) {
      reddit('https://feed.reddit.com/', function(err, items) {
        expect(items[0].id).to.equal('1234');
        expect(items[0].domain).to.equal('awesome.domain.com');
        expect(items[0].subreddit).to.equal('subreddit');
        expect(items[0].thumbnail).to.equal('http://awesome.thumbnail.com/');
        expect(items[0].title).to.equal('title');
        expect(items[0].url).to.equal('http://awesome.url.com/');
        done();
      });
    });
  });

  describe('404 Not Found', function() {
    before(function(done) {
      sinon
        .stub(request, 'get')
        .yields(null, { statusCode: 404 }, null);
      done();
    });

    it('should return 404 when page not found', function(done) {
      reddit('http://daan.vosdewael.com/404', function(err, items) {
        expect(request.get.called).to.be.true;
        expect(err).to.be.true;
        expect(items).to.be.empty;
        done();
      });
    });
  });

});
