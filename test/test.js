var adt = require('../node_adt.js');
var assert = require('assert');

describe('Adt', function() {
  describe('.hello', function () {
    it('should return "hello world"', function () {
      assert.equal(adt.hello(), 'hello world');
    });
  });
});
