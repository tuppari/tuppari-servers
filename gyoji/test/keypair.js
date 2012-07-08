var db = require('../lib/db');

var should = require('should'),
  uuid = require('node-uuid');

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

})