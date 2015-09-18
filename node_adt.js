var fs = require('fs');

var Adt = function() {

  this.open = function(path) {
    this.data = fs.readFileSync(path);
    return this.parseHeader();
  }

  this.parseHeader = function() {
    var header = {};

    header.recordCount  = this.data.readUIntLE(24);
    header.columnCount  = this.data.readUIntLE(33);
    header.recordLength = this.data.readUIntLE(36);

    return header;
  }
};

module.exports = new Adt();
