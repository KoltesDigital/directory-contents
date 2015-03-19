var assert = require('assert');
var directoryContents = require('..');
var fs = require('fs');
var path = require('path');

describe('directory-contents', function() {
	var dir = path.join(__dirname, 'dir');
	
	describe('asynchronously', function() {
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
					}
				}
			}, function(err, contents) {
				if (err)
					return done(err);
				
				assert.deepEqual(contents.config, {});
				assert.strictEqual(contents.math, 52);
				assert.ok(!contents.hasOwnProperty('recipe'));
				
				return done();
			});
		});
	});
	
	describe('synchronously', function() {
		it('gets directory contents', function() {
			var contents = directoryContents.sync(dir);
			
			assert.deepEqual(contents.config, {
				development: {
					port: 3000
				}
			});
			assert.strictEqual(contents.math.add(2, 3), 5);
			assert.strictEqual(contents.recipe, 'Choux à la crème');
		});
		
		it('gets directory contents without stripping extensions', function() {
			var contents = directoryContents.sync(dir, {
				stripExtensions: false
			});
			
			assert.deepEqual(contents.config, {
				"development.json": {
					port: 3000
				}
			});
			assert.strictEqual(contents['math.js'].add(2, 3), 5);
			assert.strictEqual(contents['recipe.txt'], 'Choux à la crème');
		});
		
		it('gets directory contents with other extensions', function() {
			var contents = directoryContents.sync(dir, {
				extensions: {
					js: function(filename, stats) {
						return stats.size;
					}
				}
			});
			
			assert.deepEqual(contents.config, {});
			assert.strictEqual(contents.math, 52);
			assert.ok(!contents.hasOwnProperty('recipe'));
		});
	});
});
