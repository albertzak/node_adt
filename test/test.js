var Adt = require('../node_adt.js');
var assert = require('assert');

describe('Adt', function() {
  describe('.open', function () {
    it('should not throw when path exists', function () {
      assert.doesNotThrow(function() { Adt.open('./test/fixtures/ARZTSTAT474.adt')});
    });

    it('should throw when path does not exist', function () {
      assert.throws(function() { Adt.open('./test/invalid')});
    });
  });

  describe('#parseHeader', function() {
    var header = {};

    beforeEach(function() {
      header = Adt.open('./test/fixtures/ARZTSTAT474.adt');
    });

    it('should get the correct record count', function () {
      assert.equal(header.recordCount, 139);
    });

    it('should get the correct column count', function () {
      assert.equal(header.columnCount, 11);
    });

    it('should get the correct record length', function () {
      assert.equal(header.recordLength, 365);
    });

    it('should get the correct data offset', function () {
      assert.equal(header.dataOffset, 2600);
    });
  });

});
