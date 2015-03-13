# directory-contents

> npm install directory-contents --save

Recursively loads directory contents as an object.

## Usage

	var directoryContents = require('directory-contents');

### directoryContents(path [, options], callback)

`options` is an optional object which can contain the following properties:

* `extensions` (default: see below) maps file extensions to loader functions
* `stripExtensions` (default: `true`) whether the extensions should be omitted in the contents' properties.

`callback` takes as first argument an Error object if an error has occured, otherwise undefined, and as second argument the contents object.

### Extensions

The `options.extensions` object specifies how the files are loaded. Keys are lowercase file extensions (`"js"`, `"txt"`...) and values are asynchronous loader functions with the signature `(path: string [, fileStats: fs.Stats], callback: (err|null, contents))`.

The default behaviors are:

* `js`: `require`s the file
* `json`: parses the file contents
* `txt`: reads the file contents (UTF8)

You can override the default loader functions, or disable one by setting it to `null`.

Example: parse YAML files

	var fs = require('fs');
	var yaml = require('js-yaml');
	
	directoryContents('test/dir', {
		extensions: {
			yaml: function(filename, callback) {
				return fs.readFile(filename, {
					encoding: 'utf8'
				}, function(err, data) {
					if (err) return callback(err);
					
					var content;
					try {
						content = yaml.load(data);
					} catch (err) {
						return callback(err);
					}
					
					return callback(null, content);
				});
			}
		}
	}, function(err, contents) { ... });
	

## Test example

Here is the structure of the directory _dir_ (located in the directory _test_):

	dir
	 |- config
	 |   |- development.js
	 |- math.js
	 |- recipe.txt

The following code loads the directory contents:

	directoryContents('test/dir', function(err, contents) {
		if (err) throw err;
		console.log(contents);
	});

Output:

	{
		config: {
			development: {
				port: 3000
			}
		},
		math: {
			add: [Function]
		},
 		recipe: 'Choux à la crème'
	}

## License

Copyright (c) 2015 Bloutiouf aka Jonathan Giroux

[MIT License](http://opensource.org/licenses/MIT)
