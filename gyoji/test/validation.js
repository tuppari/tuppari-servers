var validation = require('../lib/validation');

var should = require('should');

describe('validation', function () {

  describe('required(not null or not undefined)', function () {
    it('should return true', function () {
      validation.required('a').should.be.true;
      validation.required('').should.be.true;
      validation.required(1).should.be.true;
      validation.required(0).should.be.true;
      validation.required(true).should.be.true;
      validation.required(false).should.be.true;
    })
  })

  describe('required(null or undefined)', function () {
    it('should return false', function () {
      var a;
      validation.required(a).should.be.false;
      validation.required(null).should.be.false;
      validation.required(undefined).should.be.false;
    })
  })

  describe('minlen(null or not undefined)', function () {
    it('should return false', function () {
      validation.minlen(null, 1).should.be.false;
      validation.minlen(null, 0).should.be.false;
      validation.minlen(undefined, 1).should.be.false;
      validation.minlen(undefined, 0).should.be.false;
    })
  })

  describe('minlen(null or not undefined)', function () {
    it('should return false', function () {
      validation.minlen(null, 1).should.be.false;
      validation.minlen(null, 0).should.be.false;
      validation.minlen(undefined, 1).should.be.false;
      validation.minlen(undefined, 0).should.be.false;
    })
  })

  describe('minlen(non string value)', function () {
    it('should return false', function () {
      validation.minlen(1, 1).should.be.false;
      validation.minlen(true, 0).should.be.false;
      validation.minlen({}, 0).should.be.false;
      validation.minlen([], 0).should.be.false;
    })
  })

  describe('minlen("abc", 2)', function () {
    it('should return true', function () {
      validation.minlen('abc', 2).should.be.true;
    })
  })

  describe('minlen("abc", 3)', function () {
    it('should return true', function () {
      validation.minlen('abc', 3).should.be.true;
    })
  })

  describe('minlen("abc", 4)', function () {
    it('should return false', function () {
      validation.minlen('abc', 4).should.be.false;
    })
  })
})