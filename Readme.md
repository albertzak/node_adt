# Node-ADT

Node ADT is a small fast library for reading Advantage Database Server database files (.ADT). It is a quick node port from the awesome rubygem by Chase Gray.

* Original Project page: <http://github.com/chasemgray/Ruby-ADT>

## Installation

    npm install node_adt

## Basic Usage

Load an ADT file:

    var Adt = require('node_adt');
    var table = Adt.open('test.adt');

Enumerate all records

    table.records.forEach(function(record) {
      console.log(record.name);
      console.log(record.email);
    });

Load a single record using <tt>records</tt>

    table.records[6]

## Limitations and known bugs

* The rubygem has many more features than this node package, such as CSV export and an ActiveRecord-like find method.
* Cannot read `Date`, `Time`, or `Datetime` columns
* ADT is read-only
* External index files are not used
* Tests are written against a database file which unfortunately I can't share.

## Acknowledgements

Thank you, Chase Gray, for all the hard work of figuring out how the ADT format works.


## License

(The MIT Licence)

Copyright (c) 2010-2010 Chase Gray <mailto:chase@ratchetsoftware.com>
Copyright (c) 2015 Albert Zak <mailto:me@albertzak.com>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
