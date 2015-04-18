var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');
var fetch = require('../lib/fetch');

describe('fetch', function() {
  before(function(done) {
    sinon
      .stub(request, 'get')
      .yields(null, null, JSON.stringify({ foo: 'bar' }));
    done();
  });

  after(function(done) {
    request.get.restore();
    done();
  });

  it('should return fetched data from url', function(done) {
    fetch('http://awesome.feed.io/', function(err, result) {
      if (err) return done(err);
      expect(request.get.called).to.be.true;
      expect(result).to.not.empty;
      done();
    });
  });
});
