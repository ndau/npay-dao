require('babel-register')({
	presets: ['env']
});
require('babel-polyfill');
require('events').EventEmitter.defaultMaxListeners = Infinity;

module.exports = require('./server.js');
