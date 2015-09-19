var Adt = require('../node_adt.js');
var assert = require('assert');
var fixture = './test/fixtures/a.adt';

describe('Adt', function() {
  describe('.open', function () {
    it('should not throw when path exists', function () {
      assert.doesNotThrow(function() { Adt.open(fixture)});
    });

    it('should throw when path does not exist', function () {
      assert.throws(function() { Adt.open('./test/invalid')});
    });
  });

  describe('#parseHeader', function() {
    var header = {};

    beforeEach(function() {
      header = Adt.open(fixture).header;
    });

    it('should get the record count', function () {
      assert.equal(header.recordCount, 1);
    });

    it('should get the column count', function () {
      assert.equal(header.columnCount, 32);
    });

    it('should get the record length', function () {
      assert.equal(header.recordLength, 523);
    });

    it('should get the data offset', function () {
      assert.equal(header.dataOffset, 6800);
    });
  });

  describe('#parseColumns', function() {
    var columns = {};

    beforeEach(function() {
      columns = Adt.open(fixture).columns;
    });

    it('should get the names for all columns', function () {
      assert.equal(columns[0].name, 'ProviderNo');
      assert.equal(columns[1].name, 'Name');
      assert.equal(columns[2].name, 'Address1');
      assert.equal(columns[3].name, 'Address2');
      assert.equal(columns[4].name, 'Address3');
      assert.equal(columns[5].name, 'City');
      assert.equal(columns[6].name, 'County');
      assert.equal(columns[7].name, 'State');
      assert.equal(columns[8].name, 'Zip');
      assert.equal(columns[9].name, 'Phone');
      assert.equal(columns[10].name, 'PhoneExt');
    });

    it('should get the types for all columns', function() {
      assert.equal(columns[0].type, 4);
      assert.equal(columns[1].type, 4);
      assert.equal(columns[2].type, 4);
      assert.equal(columns[3].type, 4);
      assert.equal(columns[4].type, 4);
      assert.equal(columns[5].type, 4);
      assert.equal(columns[6].type, 4);
      assert.equal(columns[7].type, 4);
      assert.equal(columns[8].type, 4);
      assert.equal(columns[9].type, 4);
      assert.equal(columns[10].type, 4);
    });

    it('should get the lengths for all columns', function() {
      assert.equal(columns[0].length, 15);
      assert.equal(columns[1].length, 50);
      assert.equal(columns[2].length, 40);
      assert.equal(columns[3].length, 40);
      assert.equal(columns[4].length, 40);
      assert.equal(columns[5].length, 18);
      assert.equal(columns[6].length, 18);
      assert.equal(columns[7].length, 2);
      assert.equal(columns[8].length, 10);
      assert.equal(columns[9].length, 15);
      assert.equal(columns[10].length, 5);
    });
  });

  describe('#parseRecords', function() {
    var records = {};

    beforeEach(function() {
      records = Adt.open(fixture).records;
    });

    it('should get all records', function () {
      assert.equal(records.length, 1);
    });

    it('should retrieve field values', function () {
      assert.equal(records[0].ProviderNo, '43-SAMPLE');
      assert.equal(records[0].Name, 'Testing Using 01 Sample Provider For Demonstration');
      assert.equal(records[0].Address1, 'This Is Address Field Number 00000000001');
      assert.equal(records[0].Address2, 'This Is Address Field Number 00000000002');
      assert.equal(records[0].Address3, 'This Is Address Field Number 00000000003');
      assert.equal(records[0].City, 'Name of City Here');
      assert.equal(records[0].County, 'Name of Cnty Here');
      assert.equal(records[0].State, 'AL');
      assert.equal(records[0].Zip, '55555-4444');
      assert.equal(records[0].Phone, '(318) 688-1949');
      assert.equal(records[0].PhoneExt, '12345');
    });

  });

});
