require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l');

var async = require('async');
var fs = require('fs');
var path = require('path');

var telegram = require('./lib/telegram.js');

var apikeys = require('./apikeys.json');
var config = require('./config.json');

// Load all existing botmodules
var botmodules = {};
// read all files from the botmodules folder and loop through them
fs.readdirSync(path.resolve(__dirname, 'botmodules')).forEach(function(modulefilename){
	var modulepath = path.resolve(__dirname, 'botmodules', modulefilename); //get the absolute path to the module
	if(path.extname(modulepath) == '.js'){
		var modulename = path.basename(modulepath, '.js'); // get the name of the module (the filename minus '.js')
		botmodules[modulename] = require(modulepath);
		console.log(modulename + " loaded");
	}
	// TODO: handle folders as botmodules
});

// Start the different Bots
async.each(config.bots, function(botConfig){
	new telegram(apikeys[botConfig.username], botConfig)
	// set the on loaded function to initialize the botmodules
	.on('loaded', function(){
		var self = this;
		// Initialize every module of the bot
		async.each(Object.keys(this.config.modules), function(moduleName, done){
			if(botmodules[moduleName] && typeof botmodules[moduleName].init == 'function'){
				botmodules[moduleName].init(self, done);
			}else{
				done();
			}
		},
		// When the initialization of the modules is finished, log the start
		function(){
			if(self.me.username.toUpperCase() != self.config.username.toUpperCase()) console.info("Warning: %s has a different username ('%s' expected, returned '%s')", self.me.first_name, self.config.username, self.me.username);
			console.log('%s started', self.me.first_name);
		});
	})
	// set the on message function to handle incoming messages
	.on('message', function(msg){
		var self = this;
		// If a message is received, pass it to all activeated modules
		async.each(Object.keys(this.config.modules), function(moduleName){
			if(botmodules[moduleName] && typeof botmodules[moduleName].process == 'function'){
				botmodules[moduleName].process(self, msg);
			}
		});
	});
});
