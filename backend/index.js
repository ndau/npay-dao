require('babel-register')({
	presets: ['env']
});
require('dotenv').config();
require('babel-polyfill');
require('events').EventEmitter.defaultMaxListeners = Infinity;

module.exports = require('./server.js');
