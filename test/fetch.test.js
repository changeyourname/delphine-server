var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');

var fetch = require('../lib/fetch');

describe('fetch', function() {
  afterEach(function(done) {
    request.get.restore();
    done();
  });

  describe('200 OK', function() {
    before(function(done) {
      sinon
        .stub(request, 'get')
        .yields(null, { statusCode: 200 }, JSON.stringify({ foo: 'bar' }));
      done();
    });

    it('should return fetched data from url', function(done) {
      fetch('http://daan.vosdewael.com/', function(err, result) {
        expect(request.get.called).to.be.true;
        expect(err).to.be.null;
        expect(result).to.not.empty;
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
      fetch('http://daan.vosdewael.com/404', function(err, result) {
        expect(request.get.called).to.be.true;
        expect(err).to.be.true;
        expect(result).to.be.empty;
        done();
      });
    });
  });
});
