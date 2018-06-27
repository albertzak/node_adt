'use strict';

var fs = require('fs');
var fsAccess = require('fs-access');
var iconv = require('iconv-lite');

var MS_PER_DAY = 1000 * 60 * 60 * 24;
var JULIAN_1970 = 2440588;

var Adt = function() {

  this.HEADER_LENGTH  = 400;
  this.COLUMN_LENGTH  = 200;

  this.LOGICAL        = 1;
  this.CHARACTER      = 4;
  this.CICHARACTER    = 20;
  this.NCHAR          = 26;
  this.DOUBLE         = 10;
  this.INTEGER        = 11;
  this.AUTOINCREMENT  = 15;
  this.SHORT          = 12;
  this.DATE           = 3;
  this.TIME           = 13;
  this.TIMESTAMP      = 14;

  this.open = function(path, encoding, callback) {
    var _this = this;
    if (typeof encoding === 'undefined' || encoding === null)
      _this.encoding = 'ISO-8859-1';
    else
      _this.encoding = encoding;

    _this.path = path;

    fsAccess(path, function(err) {
      if (err) return callback(err, _this);

      fs.open(_this.path, 'r', function(err, fd) {
        _this.fd = fd;

        _this.parseHeader(function(err, _this) {
          if (err) return callback(err, _this);

          _this.parseColumns(function(err, _this) {
            if (err) return callback(err, _this);
            callback(null, _this);
          });
        });

      });
    });
  }

  // Determine record count, column count, record length, and data offset
  this.parseHeader = function(callback) {
    var _this = this;

    fs.read(_this.fd, new Buffer(_this.HEADER_LENGTH), 0, _this.HEADER_LENGTH, 0, function(err, bytes, buffer) {
      if (err) return callback(err);

      var header = {};

      try {
        header.recordCount  = buffer.readUInt32LE(24, 4);
        header.dataOffset   = buffer.readUInt32LE(32, 4);
        header.recordLength = buffer.readUInt32LE(36, 4);
        header.columnCount  = (header.dataOffset-400)/200;
        _this.header = header;
      } catch(e) {
        return callback(e, _this);
      }

      callback(err, _this);
    });
  }

  // Retrieves column information from the database
  this.parseColumns = function(callback) {
    var _this = this;

    // column information is located after the header
    // 200 bytes of information for each column
    var columnsLength = _this.COLUMN_LENGTH * _this.header.columnCount;
    var tempBuffer = new Buffer(_this.HEADER_LENGTH + columnsLength);
    fs.read(_this.fd, tempBuffer, 0, columnsLength, _this.HEADER_LENGTH, function(err, bytes, buffer) {
      if (err) return callback(err, _this);

      _this.columns = [];

      for (var i=0; i < _this.header.columnCount; i++) {
        try {
          var column = buffer.slice(_this.COLUMN_LENGTH * i);

          // column names are the first 128 bytes and column info takes up the last 72 bytes.
          // byte 130 contains a 16-bit column type
          // byte 136 contains a 16-bit length field
          var name = iconv.decode(column.slice(0, 128), _this.encoding).replace(/\0/g, '').trim();
          var type = column.readUInt16LE(129);
          var length = column.readUInt16LE(135);

          _this.columns.push({name: name, type: type, length: length});
        } catch(e) {
          return callback(e, _this);
        }
      }

      callback(err, _this);
    });

  }

  this.eachRecord = function(options, iterator, callback) {
    var _this = this;

    // Shuffle arguments if no options object was given
    if (typeof options === 'function') {
      callback = iterator;
      iterator = options;
      options = {};
    }

    // Calculate iteration limits
    var startingIndex = typeof options.offset === 'number' ? options.offset : 0;
    if (startingIndex < 0) startingIndex = 0;
    if (startingIndex > _this.header.recordCount) startingIndex = _this.header.recordCount;
    var finishedIndex =  typeof options.limit === 'number' ? startingIndex + options.limit : _this.header.recordCount;
    if (finishedIndex < startingIndex) finishedIndex = startingIndex;
    if (finishedIndex > _this.header.recordCount) finishedIndex = _this.header.recordCount;

    var iteratedCount = 0;

    // Handle empty tables
    if (startingIndex === finishedIndex) {
      if (typeof callback === 'function') {
        setTimeout(function () { callback(null, _this); }, 1);
      }
      return;
    }

    // Handle non-empty tables
    readNextRecord(); // start with the first record

    function readNextRecord() {
      var start  = _this.header.dataOffset + _this.header.recordLength * (startingIndex + iteratedCount);
      var end    = start + _this.header.recordLength;
      var length = end - start;
      var tempBuffer = new Buffer(length);

      fs.read(_this.fd, tempBuffer, 0, length, start, function(err, bytes, buffer) {
        if (err) {
          if (typeof callback === 'function') {
            return callback(err, _this);
          }
          else {
            // An error occurred but no callback was given, so raise an 'uncaughtException' event
            throw new Error(err);
          }
        }

        var record = null;

        if (buffer.readInt8(0) === 5) {
          // skip record if it is marked as deleted (first byte = 0x05)
        }
        else {
          try {
            record = _this.parseRecord(buffer, _this.encoding);
            iterator(null, record);
          } catch(e) {
            return iterator(e, record);
          }
        }

        iteratedCount++;
        if (startingIndex + iteratedCount < finishedIndex) {
          readNextRecord();
        }
        else {
          if (typeof callback === 'function') {
            callback(null, _this);
          }
        }
      });
    } // function readOneRecord
  }

  this.findRecord = function(recordNumber, callback) {
    var _this = this;

    if (recordNumber > _this.header.recordCount)
      return callback('record number is greater than the record count (' + _this.header.recordCount + ')', _this);

    var start  = _this.header.dataOffset + _this.header.recordLength * recordNumber;
    var end    = start + _this.header.recordLength;
    var length = end - start;
    var tempBuffer = new Buffer(length);

    fs.read(_this.fd, tempBuffer, 0, length, start, function(err, bytes, buffer) {
      if (err) return callback(err, null);

      var record = null;

      try {
        record = _this.parseRecord(buffer, _this.encoding);
      } catch(e) {
        return callback(e, record);
      }

      callback(null, record);
    });

    return _this;
  }

  this.close = function() {
    if (this.fd) {
      fs.close(this.fd, function () {/* no-op */});
      this.fd = null;
    }
  };

  this.parseRecord = function(buffer, encoding) {
    var _this = this;
    // skip the first 5 bytes, don't know what they are for and they don't contain the data.
    buffer = buffer.slice(5);

    var record = {};
    var offset = 0;

    for(var i=0; i < _this.header.columnCount; i++) {
      var start = offset;
      var end = offset + _this.columns[i].length;
      var field = buffer.slice(start, end);
      record[_this.columns[i].name] = _this.parseField(field, _this.columns[i].type, _this.columns[i].length, encoding);
      offset += _this.columns[i].length;
    }

    return record;
  }

  // Reference:
  // http://devzone.advantagedatabase.com/dz/webhelp/advantage8.1/server1/adt_field_types_and_specifications.htm
  this.parseField = function(buffer, type, length, encoding) {
    var value;

    switch(type) {
      case this.CHARACTER:
      case this.CICHARACTER:
        value = iconv.decode(buffer, encoding).replace(/\0/g, '').trim();
        break;

      case this.NCHAR:
        value = buffer.toString('ucs2', 0, length).replace(/\0/g, '').trim();
        break;

      case this.DOUBLE:
        value = buffer.readDoubleLE(0);
        break;

      case this.AUTOINCREMENT:
        value = buffer.readUInt32LE(0);
        break;

      case this.INTEGER:
        value = buffer.readInt32LE(0);
        if (value === -2147483648) value = null;
        break;

      case this.SHORT:
        value = buffer.readInt16LE(0);
        break;

      case this.LOGICAL:
        var b = iconv.decode(buffer, encoding);
        value = (b === 'T' || b === 't' || b === '1' || b === 'Y' || b === 'y' || b === ' ')
        break;

      case this.DATE:
        var julian = buffer.readInt32LE(0);
        value = julian === 0 ? null : new Date((julian - JULIAN_1970) * MS_PER_DAY);
        break;

      case this.TIMESTAMP:
        var julian = buffer.readInt32LE(0);
        var ms = buffer.readInt32LE(4);
        value = julian === 0 && ms === -1 ? null : new Date((julian - JULIAN_1970) * MS_PER_DAY + ms);
        break;

      // not implemented
      case this.TIME:
        value = buffer;
        break;

      default:
        value = null;
    }

    return value;
  }

  return this;

};

module.exports = Adt;
