var assert = require('assert');
var directoryContents = require('..');
var fs = require('fs');
var path = require('path');

describe('directory-contents', function() {
	var dir = path.join(__dirname, 'dir');
	
	it('gets directory contents', function(done) {
		return directoryContents(dir, function(err, contents) {
			if (err)
				return done(err);
			
			assert.deepEqual(contents.config, {
				development: {
					port: 3000
				}
			});
			assert.strictEqual(contents.math.add(2, 3), 5);
			assert.strictEqual(contents.recipe, 'Choux à la crème');
			
			return done();
		});
	});
	
	it('gets directory contents without stripping extensions', function(done) {
		return directoryContents(dir, {
			stripExtensions: false
		}, function(err, contents) {
			if (err)
				return done(err);
			
			assert.deepEqual(contents.config, {
				"development.json": {
					port: 3000
				}
			});
			assert.strictEqual(contents['math.js'].add(2, 3), 5);
			assert.strictEqual(contents['recipe.txt'], 'Choux à la crème');
			
			return done();
		});
	});
	
	it('gets directory contents with other extensions', function(done) {
		return directoryContents(dir, {
			extensions: {
				js: function(filename, stats, callback) {
					return callback(null, stats.size);
				},
				json: null
			}
		}, function(err, contents) {
			if (err)
				return done(err);
			
			assert.deepEqual(contents.config, {});
			assert.strictEqual(contents.math, 52);
			assert.strictEqual(contents.recipe, 'Choux à la crème');
			
			return done();
		});
	});
});
