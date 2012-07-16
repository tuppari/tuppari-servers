var db = require('../lib/db');

var should = require('should'),
  uuid = require('node-uuid'),
  async = require('async');

describe('db.keypair', function () {

  before(function (done) {
    this.timeout(120 * 1000/*120sec*/);
    db.createTables(done);
  });

  describe('create()', function () {
    it('should create a new keypair', function (done) {
      var applicationId = uuid.v1();

      db.keypair.create(applicationId, function (err, keypair) {
        if (err) return done(err);

        should.exist(keypair);
        keypair.applicationId.should.eql(applicationId);
        should.exist(keypair.accessKeyId);
        should.exist(keypair.accessSecretKey);

        db.keypair.find(applicationId, keypair.accessKeyId, function (err, data) {
          if (err) return done(err);
          data.applicationId.should.eql(applicationId);
          data.accessKeyId.should.eql(keypair.accessKeyId);
          data.accessSecretKey.should.eql(keypair.accessSecretKey);
          done();
        });
      });
    })

    it('can create a new keypairs for same applicationId', function (done) {
      var applicationId = uuid.v1();

      db.keypair.create(applicationId, function (err, keypair) {
        if (err) return done(err);
        should.exist(keypair);

        db.keypair.create(applicationId, function (err, keypair) {
          if (err) return done(err);
          should.exist(keypair);
          done();
        });
      });
    })
  })

  describe('findByApplicationIds()', function () {
    it('should returns keypairs that have applicationId included in specified list', function (done) {
      var appIds = [ uuid.v1(), uuid.v1() ];

      async.series([
        function (callback) {
          db.keypair.create(appIds[0], callback);
        },
        function (callback) {
          db.keypair.create(appIds[1], callback);
        },
        function (callback) {
          db.keypair.findByApplicationIds(appIds, callback);
        }
      ],
      function (err, results) {
        if (err) return done(err);

        var apps = results[2];
        apps.should.have.lengthOf(2);

        apps.forEach(function (app) {
          switch (app.applicationId) {
          case appIds[0]:
          case appIds[1]:
            should.exist(app.accessKeyId);
            should.exist(app.accessSecretKey);
            break;

          default:
            return done(new Error('Invalid applicationId: ' + app.applicationId));
          }
        });

        done();
      });
    })

    it('should returns empty array when argument is empty array', function (done) {
      db.keypair.findByApplicationIds([], function (err, keypairs) {
        if (err) return done(err);

        console.log(keypairs);
        keypairs.should.be.empty
        done();
      })
    })
  })

})