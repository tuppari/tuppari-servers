var wss = require('../lib/wss');

var should = require('should'),
  util = require('util'),
  request = require('request'),
  env = require('../../common/lib/env');

var PORT = 9000;

describe ('wss', function () {

  describe ('listen()', function () {
    it ('start server and it should serve endpoint URL', function (done) {
      wss.listen(PORT, function (server, hostName, port) {
        hostName.should.eql(env('HOST_NAME'));
        port.should.eql(PORT);

        request(util.format('http://%s:%d/endpoint', hostName, port), function (err, res, body) {
          server.close();

          if (err) return done(err);

          body.should.eql(util.format('ws://%s:%d', hostName, port));
          done();
        });
      });
    })
  })

})
