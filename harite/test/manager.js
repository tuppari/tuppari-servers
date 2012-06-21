var Manager = require('../lib/manager');

var
  should = require('should'),
  events = require('events'),
  util = require('util'),
  http = require('http'),
  Socket = require('../lib/socket');

describe ('Manager', function () {

  describe ('constructor', function () {

    it ('should initialize instance', function (done) {
      var server = http.createServer();
      var manager = new Manager(server);

      manager.server.should.eql(server);
      should.exist(manager.webSocketServer);
      should.exist(manager.sockets);
      should.exist(manager.rooms);

      done();
    });

    if ('should add listener for "error" event', function (done) {
      var server = http.createServer();
      var manager = new Manager(server);

      should.exist(manager.webSocketServer);
      manager.on('error', function (err) {
        err.message.should.eql('test');
        done();
      });

      manager.webSocketServer.emit('error', new Error('test'));
    });

  });

  describe ('addToRoom()', function () {

    it ('should add socket to specified room', function (done) {
      var server = http.createServer();
      var manager = new Manager(server);
      var room = 'test';
      var socketIds = [ 1, 2, 3, 4, 5 ];

      socketIds.forEach(function (id) {
        manager.addToRoom(room, id);
        manager.rooms[room][id].should.be.true;
      });

      Object.keys(manager.rooms[room]).should.have.lengthOf(socketIds.length);

      done();
    });

  });

  describe ('removeFromRoom()', function () {

    it ('should remove socket to specified room', function (done) {
      var server = http.createServer();
      var manager = new Manager(server);
      var room = 'test';
      var socketIds = [ 1, 2, 3, 4, 5 ];

      var i = 0;
      socketIds.forEach(function (id) {
        ++i;
        manager.addToRoom(room, id);
        manager.rooms[room][id].should.be.true;
        Object.keys(manager.rooms[room]).should.have.lengthOf(i);
      });

      socketIds.forEach(function (id) {
        --i;
        manager.removeFromRoom(room, id);
        should.not.exist(manager.rooms[room][id]);
        Object.keys(manager.rooms[room]).should.have.lengthOf(i);
      });

      Object.keys(manager.rooms[room]).should.be.empty;

      done();
    });

    it ('should do nothing if room is not exists', function (done) {
      var server = http.createServer();
      var manager = new Manager(server);

      var room = 'test';
      var socketId = 1;

      manager.removeFromRoom(room, socketId);
      should.not.exist(manager.rooms[room]);

      done();
    });

  });

  describe ('broadcast()', function () {

    it ('should broadcast message to socket in the specified room', function (done) {
      var server = http.createServer();
      var manager = new Manager(server);
      var wss = manager.webSocketServer;
      var room = 'a:b:test';
      var room2 = 'a:b:test2';
      var socketCount = 1000;
      var i = 0;
      var j = 0;
      var callCount = 0;

      function MockClient() {
      }
      util.inherits(MockClient, events.EventEmitter);

      MockClient.prototype.send = function (message) {
        var obj = JSON.parse(message);
        obj.room.should.eql(room);
        obj.message.should.eql('message1');

        if (++callCount === (socketCount / 2)) {
          done();
        }
      };

      manager.on('connection', function (socket) {
        if (++j % 2 == 0) {
          socket.join('a', 'b', 'test');
        }
      });

      for (i = 0; i < socketCount; i++) {
        wss.emit('connection', new MockClient());
      }

      // room2 にはメッセージは配信されないことを確認
      manager.broadcast(room2, 'message2');

      manager.broadcast(room, 'message1');
    });

  });

});