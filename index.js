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
	bot = new telegram(apikeys[botConfig.username], botConfig, function(bot){
		// Initialize every module of the bot
		async.each(Object.keys(bot.config.modules), function(moduleName, done){
			if(typeof botmodules[moduleName].init == 'function'){
				botmodules[moduleName].init(bot, done);
			}else{
				done();
			}
		},
		// When the initialization of the modules is finished, set an onMessage function
		function(){
			if(bot.me.username.toUpperCase() != bot.config.username.toUpperCase()) console.info("Warning: Bot has a different username")
			bot.on('message', function(msg){
				// If a message is received, pass it to all activeated modules
				async.each(Object.keys(bot.config.modules), function(moduleName){
					if(typeof botmodules[moduleName].process == 'function'){
						botmodules[moduleName].process(bot, msg);
					}
				});
			})
			console.log(bot.me.username + ' started');
		});
	});
});
