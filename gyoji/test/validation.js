var validation = require('../lib/validation');

var should = require('should');

describe('validation', function () {

  describe('required()', function () {
    it('should return true when argument is not null or not undefined', function () {
      validation.required('a').should.be.true;
      validation.required('').should.be.true;
      validation.required(1).should.be.true;
      validation.required(0).should.be.true;
      validation.required(true).should.be.true;
      validation.required(false).should.be.true;
    })

    it('should return false when argument is null or undefined', function () {
      var a;
      validation.required(a).should.be.false;
      validation.required(null).should.be.false;
      validation.required(undefined).should.be.false;
    })
  })

  describe('minlen()', function () {
    it('should return false when argument is null or undefined', function () {
      validation.minlen(null, 1).should.be.false;
      validation.minlen(null, 0).should.be.false;
      validation.minlen(undefined, 1).should.be.false;
      validation.minlen(undefined, 0).should.be.false;
    })

    it('should return false when argument type is not string', function () {
      validation.minlen(1, 1).should.be.false;
      validation.minlen(true, 0).should.be.false;
      validation.minlen({}, 0).should.be.false;
      validation.minlen([], 0).should.be.false;
    })

    it('should return true when first argument length less than second argument number', function () {
      validation.minlen('abc', 2).should.be.true;
    })

    it('should return true when first argument length equals second argument number', function () {
      validation.minlen('abc', 3).should.be.true;
    })

    it('should return false when first argument length grather than second argument number', function () {
      validation.minlen('abc', 4).should.be.false;
    })
  })

})