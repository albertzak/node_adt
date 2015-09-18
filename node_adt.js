var fs = require('fs');
var iconv = require('iconv-lite');

var Adt = function() {

  var HEADER_LENGTH = 400,
      COLUMN_LENGTH = 200;

  this.open = function(path, encoding) {
    if (typeof encoding === 'undefined')
      this.encoding = 'ISO-8859-1';
    else
      this.encoding = encoding;

    this.data = fs.readFileSync(path);
    this.header = this.parseHeader();
    this.columns = this.parseColumns();
    this.records = this.parseRecords();

    return this;
  }

  // Determine record count, column count, record length, and data offset
  this.parseHeader = function() {
    var header = {};

    header.recordCount  = this.data.readUIntLE(24, 4);
    header.dataOffset   = this.data.readUIntLE(32, 4);
    header.recordLength = this.data.readUIntLE(36, 4);
    header.columnCount  = (header.dataOffset-400)/200;

    return header;
  }

  // Retrieves column information from the database
  this.parseColumns = function() {
    var columns = [];

    for(var i=0; i < this.header.columnCount; i++) {
      // skip past header to get to column information
      var column = this.data.slice(HEADER_LENGTH + COLUMN_LENGTH * i);

      // column names are the first 128 bytes and column info takes up the last 72 bytes.
      // byte 130 contains a 16-bit column type
      // byte 136 contains a 16-bit length field
      var name = iconv.decode(column.slice(0, 128), this.encoding).replace(/\0/g, '').trim();
      var type = column.readUInt16LE(129);
      var length = column.readUInt16LE(135);

      if (length > 0) {
        columns.push({name: name, type: type, length: length});
      }
    }

    // Reset the column count in case any were skipped
    this.header.columnCount = columns.length;
    return columns;
  }

  this.parseRecords = function() {
    var records = [];

    for(var i=0; i < this.header.recordCount; i++) {
      var start  = this.header.dataOffset + this.header.recordLength * i;
      var end    = start + this.header.recordLength;
      var record = this.data.slice(start, end);
      record = this.parseRecord(record, this.encoding);
      records.push(record);
    }

    return records;
  }

  this.parseRecord = function(buffer, encoding) {
    // skip the first 5 bytes, don't know what they are for and they don't contain the data.
    buffer = buffer.slice(5);

    var record = {};
    var offset = 0;

    for(var i=0; i<this.header.columnCount; i++) {
      var start = offset;
      var end = offset + this.columns[i].length;
      var field = buffer.slice(start, end);
      record[this.columns[i].name] = this.parseField(field, this.columns[i].type, this.columns[i].length, encoding);
      offset += this.columns[i].length;
    }

    return record;
  }

  this.parseField = function(buffer, type, length, encoding) {
    var value;

    switch(type) {
      // character, cicharacter
      case 4:
      case 20:
        value = iconv.decode(buffer, encoding).replace(/\0/g, '').trim();
        break;

      // double
      case 10:
        value = buffer.readDoubleLE(0);
        break;

      // integer, autoinc
      case 11:
      case 15:
        value = buffer.readUIntLE(0);
        break;

      // short
      case 12:
        value = buffer.readUInt16LE(0);
        break;

      // date, time, timestamp
      // not implemented
      case 3:
      case 13:
      case 14:
        value = buffer;
        break;

      default:
        value = null;
    }

    return value;
  }

};

module.exports = new Adt();
