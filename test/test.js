var Adt = require('../node_adt.js');
var assert = require('assert');
var fixture = './test/fixtures/AbrGru.ADT';

describe('Adt', function() {
  describe('.open', function () {
    var adt = null;

    beforeEach(function() {
      adt = new Adt();
    })

    it('should not throw exceptions', function(done) {
      assert.doesNotThrow(function() {
        adt.open(fixture, 'ISO-8859-1', function(err, obj) {
          assert(err === null);
          done();
          return;
        });
      });
    });

    it('should check for file permissions', function(done) {
      adt.open('non-existant-path', 'ISO-8859-1', function(err, cb) {
        assert(err.code === 'ENOENT');
        done();
        return;
      });
    });
  });

  describe('define type constants', function() {
    it('for string fields', function() {
      assert.equal(new Adt().CHARACTER, 4);
      assert.equal(new Adt().CICHARACTER, 20);
    });

    it('for double fields', function() {
      assert.equal(new Adt().DOUBLE, 10);
    });

    it('for integer fields', function() {
      assert.equal(new Adt().INTEGER, 11);
      assert.equal(new Adt().AUTOINCREMENT, 15);
    });

    it('for short fields', function() {
      assert.equal(new Adt().SHORT, 12);
    });

    it('for boolean fields', function() {
      assert.equal(new Adt().LOGICAL, 1);
    });

    it('for date fields', function() {
      assert.equal(new Adt().DATE, 3);
      assert.equal(new Adt().TIME, 13);
      assert.equal(new Adt().TIMESTAMP, 14);
    });
  });

  describe('#parseHeader', function() {
    var adt = null;
    var header = null;

    beforeEach(function(done) {
      adt = new Adt();
      adt.open(fixture, 'ISO-8859-1', function(err, obj) {
        assert(err === null);
        header = obj.header;
        done();
      });
    });

    it('should get the record count', function() {
      assert.equal(header.recordCount, 9);
    });

    it('should get the column count', function() {
      assert.equal(header.columnCount, 20);
    });

    it('should get the record length', function() {
      assert.equal(header.recordLength, 106);
    });

    it('should get the data offset', function() {
      assert.equal(header.dataOffset, 4400);
    });
  });

  describe('#parseColumns', function() {
    var adt = null;
    var columns = null;

    beforeEach(function(done) {
      adt = new Adt();
      adt.open(fixture, 'ISO-8859-1', function(err, obj) {
        assert(err === null);
        columns = obj.columns;
        done();
      });
    });

    it('should get the names for all columns', function () {
      assert.equal(columns[0].name, 'AbrGruId');
      assert.equal(columns[1].name, 'Such');
      assert.equal(columns[2].name, 'Bez');
      assert.equal(columns[3].name, 'AbrKennz');
      assert.equal(columns[4].name, 'AbrEmpfId');
      assert.equal(columns[5].name, 'VerrKennz');

      assert.equal(columns[16].name, 'MwstAusgl');

      assert.equal(columns[18].name, 'Wahlarzt');
      assert.equal(columns[19].name, 'MwstGrup');
    });

    it('should get the types for all columns', function() {
      assert.equal(columns[0].type, adt.INTEGER);
      assert.equal(columns[1].type, adt.CHARACTER);
      assert.equal(columns[2].type, adt.CHARACTER);
      assert.equal(columns[3].type, adt.SHORT);
      assert.equal(columns[4].type, adt.INTEGER);
      assert.equal(columns[5].type, adt.SHORT);
      assert.equal(columns[6].type, adt.SHORT);
      assert.equal(columns[7].type, adt.SHORT);
      assert.equal(columns[8].type, adt.LOGICAL);
      assert.equal(columns[9].type, adt.LOGICAL);
      assert.equal(columns[10].type, adt.LOGICAL);
      assert.equal(columns[11].type, adt.CHARACTER);
      assert.equal(columns[12].type, adt.CHARACTER);
      assert.equal(columns[13].type, adt.SHORT);
      assert.equal(columns[14].type, adt.LOGICAL);
      assert.equal(columns[15].type, adt.CHARACTER);
      assert.equal(columns[16].type, adt.DOUBLE);
      assert.equal(columns[17].type, adt.CHARACTER);
      assert.equal(columns[18].type, adt.LOGICAL);
      assert.equal(columns[19].type, adt.INTEGER);
    });

    it('should get the lengths for all columns', function() {
      assert.equal(columns[0].length, 4);
      assert.equal(columns[1].length, 6);
      assert.equal(columns[2].length, 30);
      assert.equal(columns[3].length, 2);
      assert.equal(columns[4].length, 4);
      assert.equal(columns[5].length, 2);
      assert.equal(columns[6].length, 2);
      assert.equal(columns[7].length, 2);
      assert.equal(columns[8].length, 1);
      assert.equal(columns[9].length, 1);
      assert.equal(columns[10].length, 1);
      assert.equal(columns[11].length, 6);
      assert.equal(columns[12].length, 6);
      assert.equal(columns[13].length, 2);
      assert.equal(columns[14].length, 1);
      assert.equal(columns[15].length, 10);
      assert.equal(columns[16].length, 8);
      assert.equal(columns[17].length, 8);
      assert.equal(columns[18].length, 1);
      assert.equal(columns[19].length, 4);
    });
  });

  describe('#eachRecord', function() {
    records = [];

    before(function(done) {
      new Adt().open(fixture, 'ISO-8859-1', function(err, adt) {
        assert(err === null);
        adt.eachRecord(function(err, record) {
          records.push(record);
        }, function() {
          done();
        });
      });
    });

    it('should retrieve field values', function () {
      assert.equal(records[0].AbrGruId, 1);
      assert.equal(records[0].Such, 'WGK');
      assert.equal(records[0].Bez, 'WGK');
      assert.equal(records[0].AbrKennz, 0);
      assert.equal(records[0].AbrEmpfId, 0);
      assert.equal(records[0].VerrKennz, 1);
      assert.equal(records[0].ZrAbr, 0);
      assert.equal(records[0].PsAbr, 0);
      assert.equal(records[0].OpKennz, false);
      assert.equal(records[0].OplKennz, false);
      assert.equal(records[0].HonKennz, false);
      assert.equal(records[0].ErstHonLst, '');
      assert.equal(records[0].FolgHonLst, '');
      assert.equal(records[0].KassenArt, 2);
      assert.equal(records[0].MtglNrKennz, false);
      assert.equal(records[0].FAnzeige, '');
      assert.equal(records[0].MwstAusgl, 0);
      assert.equal(records[0].DateHidden, '00000000');
      assert.equal(records[0].Wahlarzt, false);
      assert.equal(records[0].MwstGrup, null);
    });

    it('should parse boolean values', function() {
      assert.equal(records[2].MtglNrKennz, true);
      assert.equal(records[0].Wahlarzt, false);
      assert.equal(records[1].Wahlarzt, false);
      assert.equal(records[2].Wahlarzt, false);
      assert.equal(records[3].Wahlarzt, false);
      assert.equal(records[4].Wahlarzt, false);
      assert.equal(records[5].Wahlarzt, true);
      assert.equal(records[6].Wahlarzt, false);
      assert.equal(records[7].Wahlarzt, false);
      assert.equal(records[8].Wahlarzt, false);
    });


    it('should handle long signed integers that can be null', function() {
      assert.equal(records[7].MwstGrup, null);
      assert.equal(records[8].MwstGrup, 0);
    });

  });

});
