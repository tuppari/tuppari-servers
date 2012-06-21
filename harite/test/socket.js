var Socket = require('../lib/socket');

var
  should = require('should'),
  events = require('events'),
  util = require('util'),
  http = require('http'),
  Manager = require('../lib/manager');

function MockClient() {
}
util.inherits(MockClient, events.EventEmitter);

describe ('Socket', function () {

  var manager;

  beforeEach (function () {
    manager = new Manager(http.createServer());
  });

  describe ('constructor', function () {

    it ('should initialize instance', function (done) {
      var client = new MockClient();
      var socket = new Socket(manager, client);

      socket.id.should.not.empty;
      socket.manager.should.eql(manager);
      socket.client.should.eql(client);

      done();
    });

    it ('should add listener for "message" and "close" events', function (done) {
      var client = new MockClient();
      var socket = new Socket(manager, client);

      socket.on('bind', function (applicationId, data) {
        applicationId.should.eql('test');
        data.channelName.should.eql('abc');
        data.eventName.should.eql('e1');
        client.emit('close');
      });

      socket.on('close', function () {
        done();
      });

      client.emit('message', '{"event":"bind","applicationId":"test","data":{"channelName":"abc", "eventName":"e1"}}');
    });

  });

  describe ('send()', function () {

    it ('should send message via client', function (done) {
      var client = new MockClient();
      var socket = new Socket(manager, client);

      client.send = function (message) {
        message.should.eql('test');
        done();
      };

      socket.send('test');
    });

  });

  describe ('json()', function () {

    it ('should send JSON.stringify(obj) via client', function (done) {
      var client = new MockClient();
      var socket = new Socket(manager, client);

      client.send = function (message) {
        message.should.eql('{"key":"value"}');
        done();
      };

      socket.json({key: 'value'});
    });

  });

  describe ('join()', function () {

    it ('should add socket to specified room', function (done) {
      var client = new MockClient();
      var socket = new Socket(manager, client);

      socket.join('a', 'b', 'c');

      manager.rooms['a:b:c'][socket.id].should.be.true;
      done();
    });

  });

  describe ('leave()', function () {

    it ('should remove socket to specified room', function (done) {
      var client = new MockClient();
      var socket = new Socket(manager, client);

      socket.join('a', 'b', 'c');
      manager.rooms['a:b:c'][socket.id].should.be.true;

      socket.leave('a', 'b', 'c');
      should.not.exist(manager.rooms['a:b:c'][socket.id]);

      done();
    });

    it ('should do nothing if room is not exists', function (done) {
      var client = new MockClient();
      var socket = new Socket(manager, client);

      var room = 'test';
      socket.leave(room);
      should.not.exist(manager.rooms[room]);

      done();
    });

  });

});