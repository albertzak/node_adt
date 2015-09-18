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
      header = Adt.open('./test/fixtures/ARZTSTAT474.adt').header;
    });

    it('should get the record count', function () {
      assert.equal(header.recordCount, 139);
    });

    it('should get the column count', function () {
      assert.equal(header.columnCount, 11);
    });

    it('should get the record length', function () {
      assert.equal(header.recordLength, 365);
    });

    it('should get the data offset', function () {
      assert.equal(header.dataOffset, 2600);
    });
  });

  describe('#parseColumns', function() {
    var columns = {};

    beforeEach(function() {
      columns = Adt.open('./test/fixtures/ARZTSTAT474.adt').columns;
    });

    it('should get the names for all columns', function () {
      assert.equal(columns[0].name, 'Id');
      assert.equal(columns[1].name, 'PatId');
      assert.equal(columns[2].name, 'Datum');
      assert.equal(columns[3].name, 'Kurzz');
      assert.equal(columns[4].name, 'Text');
      assert.equal(columns[5].name, 'Info');
      assert.equal(columns[6].name, 'TextColor');
      assert.equal(columns[7].name, 'BackColor');
      assert.equal(columns[8].name, 'InfTextCol');
      assert.equal(columns[9].name, 'InfBackCol');
      assert.equal(columns[10].name, 'CodeInfo');
    });
  });

});
