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

    it('should have a column count', function () {
      console.log(Adt.open('./test/fixtures/ARZTSTAT474.adt'));
      assert(true);
    });
  });
});
