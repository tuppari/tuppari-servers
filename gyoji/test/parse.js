var parse = require('../lib/parse');

var should = require('should'),
  sinon = require('sinon'),
  EventEmitter = require('events').EventEmitter,
  util = require('util');

function RequestMock() {
  this.setEncoding = function (encoding) {
    console.log(encoding);
  };
  this.headers = {};
}
util.inherits(RequestMock, EventEmitter);

function ResponseMock() {
  this.badRequest = function (e) {
    console.log(e);
  };
}
util.inherits(ResponseMock, EventEmitter);

describe('parse', function () {

  describe('json()', function () {
    it('should return parsed JSON object', function (done) {
      var req = new RequestMock();
      req.headers['content-type'] = 'application/json';

      var res = new ResponseMock();

      var reqMock = sinon.mock(req);
      reqMock.expects('setEncoding').once().withExactArgs('utf8');

      parse.json(req, res, function (err, body) {
        body.key1.should.eql('value1');
        reqMock.verify();
        done();
      });

      req.emit('data', '{ "key1": "value1" }');
      req.emit('end');
    })

    it('should return badRequest when content-type is "application/json", but body is illegal format', function (done) {
      var req = new RequestMock();
      req.headers['content-type'] = 'application/json';

      var res = new ResponseMock();

      var reqMock = sinon.mock(req);
      reqMock.expects('setEncoding').once().withExactArgs('utf8');

      parse.json(req, res, function (err, body) {
        err.message.should.eql('Unexpected end of input');
        reqMock.verify();
        done();
      });

      req.emit('data', '{ "key1": "value');
      req.emit('end');
    })

    it('should return badRequest when content-type is "application/json", but request error occured', function (done) {
      var req = new RequestMock();
      req.headers['content-type'] = 'application/json';

      var res = new ResponseMock();

      var reqMock = sinon.mock(req);
      reqMock.expects('setEncoding').once().withExactArgs('utf8');

      parse.json(req, res, function (err, body) {
        err.message.should.eql('ERR');
        reqMock.verify();
        done();
      });

      req.emit('error', new Error('ERR'));
    })

    it('should return badRequest when content-type is not "application/json"', function (done) {
      var req = new RequestMock();
      req.headers['content-type'] = 'text/plain';

      var res = new ResponseMock();

      var reqMock = sinon.mock(req);
      reqMock.expects('setEncoding').once().withExactArgs('utf8');

      parse.json(req, res, function (err, body) {
        err.message.should.eql('Content-Type must be application/json, but text/plain');
        reqMock.verify();
        done();
      });
    })
  })

})
