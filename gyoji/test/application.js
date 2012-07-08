var db = require('../lib/db');

var should = require('should'),
  uuid = require('node-uuid'),
  util = require('util');

describe('db.application', function () {

  before(function (done) {
    this.timeout(120 * 1000/*120sec*/);
    db.createTables(done);
  });

  describe('create()', function () {
    it('should create a new application', function (done) {
      var accountId = uuid.v1();
      var name = 'test';

      db.application.create(accountId, name, function (err, application) {
        if (err) return done(err);

        should.exist(application);
        application.accountId.should.eql(accountId);
        application.name.should.eql(name);
        should.exist(application.applicationId);

        db.application.find(accountId, name, function (err, data) {
          if (err) return done(err);
          data.accountId.should.eql(accountId);
          data.name.should.eql(application.name);
          data.applicationId.should.eql(application.applicationId);
          done();
        });
      });
    })

    it('should return error when same application name is already exists', function (done) {
      var accountId = uuid.v1();
      var name = 'test';

      db.application.create(accountId, name, function (err, application) {
        if (err) return done(err);

        db.application.create(accountId, name, function (err, application) {
          should.exist(err);
          err.message.should.eql(util.format('application [%s:%s] is already exists', accountId, name));
          done();
        });
      });
    })
  })

})