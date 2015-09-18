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

    it('should get the types for all columns', function() {
      assert.equal(columns[0].type, 15);
      assert.equal(columns[1].type, 11);
      assert.equal(columns[2].type, 4);
      assert.equal(columns[3].type, 4);
      assert.equal(columns[4].type, 4);
      assert.equal(columns[5].type, 4);
      assert.equal(columns[6].type, 11);
      assert.equal(columns[7].type, 11);
      assert.equal(columns[8].type, 11);
      assert.equal(columns[9].type, 11);
      assert.equal(columns[10].type, 4);
    });

    it('should get the lengths for all columns', function() {
      assert.equal(columns[0].length, 4);
      assert.equal(columns[1].length, 4);
      assert.equal(columns[2].length, 10);
      assert.equal(columns[3].length, 6);
      assert.equal(columns[4].length, 120);
      assert.equal(columns[5].length, 80);
      assert.equal(columns[6].length, 4);
      assert.equal(columns[7].length, 4);
      assert.equal(columns[8].length, 4);
      assert.equal(columns[9].length, 4);
      assert.equal(columns[10].length, 120);
    });
  });

  describe('#parseRecords', function() {
    var records = {};

    beforeEach(function() {
      records = Adt.open('./test/fixtures/ARZTSTAT474.adt').records;
    });

    it('should get all records', function () {
      assert.equal(records.length, 139);
    });

    it('should encode fields to utf-8', function () {
      assert.equal(records[4].Text, 'Übersicht Leistungen:');
    });

  });

});
