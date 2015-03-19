var async = require('async');
var fs = require('fs');
var merge = require('merge');
var path = require('path');

function requireAsync(filename, callback) {
	var data;
	try {
		data = require(filename);
	} catch (err) {
		return callback(err);
	}
	return callback(null, data);
}

function readFileAsync(filename, callback) {
	return fs.readFile(filename, callback);
}

function readTextAsync(filename, callback) {
	return fs.readFile(filename, {
		encoding: 'utf8'
	}, callback);
}

module.exports = function(dir, options, callback) {
	if (!callback) {
		callback = options;
		options = null;
	}
	
	options = merge({
		extensions: {
			js: requireAsync,
			json: requireAsync,
			txt: readTextAsync,
			"*": readFileAsync
		},
		recursive: true,
		stripExtensions: true,
	}, options);
	
	function parseDir(dir, callback) {
		var contents = {};
		
		return async.waterfall([
			function(callback) {
				return fs.readdir(dir, callback);
			},
			
			function(filenames, callback) {
				return async.each(filenames, function(filename, callback) {
					var filepath = path.resolve(dir, filename);
					return fs.stat(filepath, function(err, stats) {
						if (err)
							return callback(err);
						
						if (stats.isDirectory() && options.recursive) {
							return parseDir(filepath, function(err, content) {
								if (err)
									return callback(err);
								
								var key = path.basename(filename);
								contents[key] = content;
								
								return callback();
							});
						}
						
						function done(err, content) {
							if (err)
								return callback(err);
							
							var key = (options.stripExtensions ? path.basename(filename, extension) : path.basename(filename));
							contents[key] = content;
							
							return callback();
						}
						
						if (stats.isFile()) {
							var extension = path.extname(filename);
							var loader = options.extensions[extension.substr(1).toLowerCase()] || options.extensions["*"];
							
							if (!loader)
								return callback();
							
							switch (loader.length) {
								case 2:
									return loader(filepath, done);
								default:
									return loader(filepath, stats, done);
							}
						}
						
						return callback();
					});
				}, callback);
			},
			
			function(callback) {
				return callback(null, contents);
			}
		], callback);
	}
	
	return parseDir(dir, callback);
};

module.exports.readFile = readFileAsync;
module.exports.readText = readTextAsync;
module.exports.require = requireAsync;

function requireSync(filename, callback) {
	return require(filename);
}

function readFileSync(filename) {
	return fs.readFileSync(filename);
}

function readTextSync(filename) {
	return fs.readFileSync(filename, {
		encoding: 'utf8'
	});
}

module.exports.sync = function(dir, options) {
	options = merge({
		extensions: {
			js: requireSync,
			json: requireSync,
			txt: readTextSync,
			"*": readFileSync
		},
		recursive: true,
		stripExtensions: true,
	}, options);
	
	function parseDir(dir) {
		var contents = {};
		
		var filenames = fs.readdirSync(dir);
		filenames.forEach(function(filename) {
			var key;
			var filepath = path.resolve(dir, filename);
			var stats = fs.statSync(filepath);
			
			if (stats.isDirectory() && options.recursive) {
				key = path.basename(filename);
				contents[key] = parseDir(filepath);
			}
			
			if (stats.isFile()) {
				var extension = path.extname(filename);
				var loader = options.extensions[extension.substr(1).toLowerCase()] || options.extensions["*"];
				
				if (!loader)
					return;
				
				key = (options.stripExtensions ? path.basename(filename, extension) : path.basename(filename));
				contents[key] = loader(filepath, stats);
			}
		});
		
		return contents;
	}
	
	return parseDir(dir);
};

module.exports.sync.readFile = readFileSync;
module.exports.sync.readText = readTextSync;
module.exports.sync.require = requireSync;
