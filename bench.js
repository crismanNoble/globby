'use strict';
var fs = require('fs');
var rimraf = require('rimraf');
var globbyMaster = require('globby');
var gs = require('glob-stream');
var globby = require('./');

var BENCH_DIR = 'bench';

var runners = [{
	name: 'globby async (working directory)',
	run: function (patterns, cb) {
		globby(patterns, cb);
	}
}, {
	name: 'globby async (upstream/master)',
	run: function (patterns, cb) {
		globbyMaster(patterns, cb);
	}
}, {
	name: 'globby sync (working directory)',
	run: function (patterns) {
		globby.sync(patterns);
	}
}, {
	name: 'globby sync (upstream/master)',
	run: function (patterns) {
		globbyMaster.sync(patterns);
	}
}, {
	name: 'glob-stream',
	run: function (patterns, cb) {
		gs.create(patterns).on('data', function () {}).on('end', cb);
	}
}];
var benchs = [{
	name: 'negative globs (100 negated paths)',
	patterns: ['bench/a/*', '!bench/a/c*']
}, {
	name: 'negative globs (500 negated paths)',
	patterns: ['bench/a/*', '!bench/a/*']
}, {
	name: 'multiple positive globs',
	patterns: ['bench/a/*', 'bench/b/*']
}];

before(function () {
	rimraf.sync(BENCH_DIR);
	fs.mkdirSync(BENCH_DIR);
	['a', 'b'].forEach(function (dir) {
		var path = BENCH_DIR + '/' + dir + '/';
		fs.mkdirSync(path);
		for (var i = 0; i < 500; i++) {
			fs.writeFileSync(path + (i < 100 ? 'c' : 'd') + i, '');
		}
	});
});

after(function () {
	rimraf.sync(BENCH_DIR);
});

benchs.forEach(function (benchmark) {
	suite(benchmark.name, function () {
		runners.forEach(function (runner) {
			bench(runner.name, runner.run.bind(null, benchmark.patterns));
		});
	});
});