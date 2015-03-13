var async = require('async');
var fs = require('fs');
var merge = require('merge');
var path = require('path');

module.exports = function(dir, options, callback) {
	if (!callback) {
		callback = options;
		options = null;
	}
	
	function loadRequire(filename, callback) {
		var data;
		try {
			data = require(filename);
		} catch (err) {
			return callback(err);
		}
		return callback(null, data);
	}
	
	function loadText(filename, callback) {
		return fs.readFile(filename, {
			encoding: 'utf8'
		}, callback);
	}
	
	options = merge.recursive({
		extensions: {
			js: loadRequire,
			json: loadRequire,
			txt: loadText
		},
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
						
						if (stats.isDirectory()) {
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
							var loader = options.extensions[extension.substr(1).toLowerCase()];
							
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
