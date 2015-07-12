require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l');

var async = require('async');
var fs = require('fs');
var path = require('path');

var telegram = require('./lib/telegram.js');

var apikeys = require('./apikeys.json');
var config = require('./config.json');

// Load all existing botmodules
var botmodules = {};
fs.readdirSync('botmodules').forEach(function(modulefilename){
	var modulepath = path.join('botmodules', modulefilename);
	if(path.extname(modulepath) == '.js'){
		var modulename = path.basename(modulepath, '.js');
		botmodules[modulename] = require(path.resolve(modulepath));
		console.log("Loaded botmodule " + modulename);
	}
	// TODO: handle folder as botmodules
});

// Start the different Bots
async.each(config.bots, function(botConfig){
	new telegram(apikeys[botConfig.username], botConfig)
	.on('loaded', function(){
		var self = this;
		// Initialize every module of the bot
		async.each(Object.keys(this.config.modules), function(moduleName, done){
			if(typeof botmodules[moduleName].init == 'function'){
				botmodules[moduleName].init(self, done);
			}else{
				done();
			}
		},
		// When the initialization of the modules is finished, set an onMessage function
		function(){
			if(self.me.username.toUpperCase() != self.config.username.toUpperCase()) console.info("Warning: Bot has a different username");
			console.log(self.me.username + ' started');
		});
	})
	.on('message', function(msg){
		var self = this;
		// If a message is received, pass it to all activeated modules
		async.each(Object.keys(this.config.modules), function(moduleName){
			if(typeof botmodules[moduleName].process == 'function'){
				botmodules[moduleName].process(self, msg);
			}
		});
	});
});
