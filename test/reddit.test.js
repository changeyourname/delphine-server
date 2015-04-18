var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');

var reddit = require('../lib/reddit');

describe('reddit', function() {
  before(function(done) {
    sinon
      .stub(request, 'get')
      .yields(null, null, JSON.stringify({
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
                id: '1234',
                author: 'foobar',
                domain: 'awesome.domain.com',
                is_self: true,
                subreddit: 'subreddit',
                thumbnail: 'http://awesome.thumbnail.com/',
                title: 'title',
                url: 'http://awesome.url.com/'
              }
            }
          ]
        }
      }));
    done();
  });

  after(function(done) {
    request.get.restore();
    done();
  });

  it('should have the correct count', function(done) {
    reddit('http://reddit.feed.com/', function(err, items) {
      if (err) return done(err);
      expect(items).to.have.length(1);
      done();
    });
  });

  it('should have only the necessary keys', function(done) {
    reddit('http://reddit.feed.com/', function(err, items) {
      if (err) return done(err);
      expect(items[0]).to.have.all.keys(['id', 'domain', 'subreddit', 'thumbnail', 'title', 'url']);
      done();
    });
  });

  it('should have the correct values', function(done) {
    reddit('http://reddit.feed.com/', function(err, items) {
      if (err) return done(err);
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
