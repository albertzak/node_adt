var fs = require('fs');

var Adt = function() {

  var HEADER_LENGTH = 400,
      COLUMN_LENGTH = 200;

  this.open = function(path) {
    this.data = fs.readFileSync(path);
    this.header = this.parseHeader();
    this.columns = this.parseColumns();

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
      var name = column.toString('ascii', 0, 128).trim().replace(/\0/g, '');

      // byte 130 contains a 16-bit column type
      var type = column.readUInt16LE(129);

      columns.push({name: name, type: type});
    }

    return columns;
  }

};

module.exports = new Adt();
