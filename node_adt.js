var fs = require('fs');

var Adt = function() {

  this.open = function(path) {
    this.data = fs.readFileSync(path);
    return this.parseHeader();
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
};

module.exports = new Adt();
