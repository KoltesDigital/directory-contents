# directory-contents

> npm install directory-contents --save

Recursively loads directory contents as an object.

## Usage

	var directoryContents = require('directory-contents');

### directoryContents(path [, options], callback)

Asynchronously loads the directory contents, passed to `callback`.

`options` is an optional object which can contain the following properties:

* `extensions` (default: see below) maps file extensions to loader functions
* `stripExtensions` (default: `true`) whether the extensions should be omitted in the contents' properties.

`callback` takes as first argument an Error object if an error has occured, otherwise undefined, and as second argument the contents object.

### Extensions

The `options.extensions` object specifies how the files are loaded. Keys are lowercase file extensions (`"js"`, `"txt"`...) and values are asynchronous loader functions with the signature `(path: string [, fileStats: fs.Stats], callback: (err|null, contents))`. `"*"` is a special key which matches unspecified extensions.

Convenient loaders are provided:

* `directoryContents.readFile`: reads the file contents as a Buffer (no encoding is presupposed)
* `directoryContents.readText`: reads the file contents as a String (encoding is UTF8)
* `directoryContents.require`: `require`s the file (works on JS and JSON files)

The default extensions are:

	{
		"js": directoryContents.require,
		"json": directoryContents.require,
		"txt": directoryContents.readText,
		"*": directoryContents.readFile
	}

When specifying a custom `extensions` object, it will fully override these default extensions.

Example: only parse YAML files

	var directoryContents = require('directory-contents');
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

### Synchronous version

In some cases, such as the start-up initialization, you may require to synchronously load the directory contents. For that, use `directoryContents.sync`. The explanations above stay true, except that the functions return the values instead of passing them to a callback.

There are also convenient synchronous loaders with the same purpose as the asynchronous ones: `directoryContents.sync.readFile`, `directoryContents.sync.readText`, and `directoryContents.sync.require`.

Example: synchronously parse YAML files

	var directoryContents = require('directory-contents');
	var fs = require('fs');
	var yaml = require('js-yaml');
	
	var contents = directoryContents.sync('test/dir', {
		extensions: {
			yaml: function(filename) {
				var data = fs.readFileSync(filename, {
					encoding: 'utf8'
				});
				return yaml.load(data);
			}
		}
	});
	...

Although this example is smaller than the previous one, don't let this fool you. In most cases, you should **use the asynchronous version**, as it implies IO operations.

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
 		recipe: 'Choux à la crème',
 		token: <Buffer 34 32>
	}

## License

Copyright (c) 2015 Bloutiouf aka Jonathan Giroux

[MIT License](http://opensource.org/licenses/MIT)
