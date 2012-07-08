var db = require('../lib/db');

var should = require('should'),
  uuid = require('node-uuid');

describe('db.account', function () {

  before(function (done) {
    this.timeout(120 * 1000/*120sec*/);
    db.createTables(done);
  });

  describe('create()', function () {
    it('should create a new account', function (done) {
      var accountId = uuid.v1();

      db.account.create(accountId, 'password', function (err, account) {
        if (err) return done(err);

        should.exist(account);
        should.exist(account.salt);
        should.exist(account.credentials);

        db.account.find(accountId, function (err, data) {
          if (err) return done(err);
          data.id.should.eql(accountId);
          done();
        });
      });
    })

    it('should return error if same account is already exists', function (done) {
      var accountId = uuid.v1();

      db.account.create(accountId, 'password', function (err) {
        if (err) return done(err);

        db.account.create(accountId, 'password', function (err) {
          should.exist(err);
          err.message.should.eql(accountId + ' is already exists.');
          done();
        });

      });
    })
  })

  describe('exists()', function () {
    it('should return false when account is not exists', function (done) {
      var accountId = uuid.v1();

      db.account.exists(accountId, function (result) {
        result.should.be.false;
        done();
      });
    })

    it('should return true if account is already exists', function (done) {
      var accountId = uuid.v1();

      db.account.create(accountId, 'password', function (err, account) {
        if (err) return done(err);

        should.exist(account);

        process.nextTick(function() {
          db.account.exists(accountId, function (result) {
            result.should.be.true;
            done();
          });
        });
      });
    })
  })

})