require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l');

var async = require('async');

var telegram = require('./lib/telegram.js');
var modules = {
	regexAnswers: require('./lib/regexAnswers.js'),
	noSpam: require('./lib/noSpam.js'),
	forwarder: require('./lib/forwarder.js')
};

var apikeys = require('./apikeys.json');
var config = require('./config.json');

// Start the different Bots
async.each(config.bots, function(botConfig){
	bot = new telegram(apikeys[botConfig.name], botConfig, function(bot){
		// Initialize every module of the bot
		async.each(bot.config.activeModules, function(moduleName, done){
			if(typeof modules[moduleName].init == 'function'){
				modules[moduleName].init(bot, done);
			}else{
				done();
			}
		},
		// When the initialization of the modules is finished, set an onMessage function
		function(){
			bot.getMe(function(me){ // Set the bot.config.me object via getMe
				bot.config.me = me;
				bot.on('message', function(msg){
					// If a message is received, pass it to all activeated modules
					async.each(bot.config.activeModules, function(moduleName){
						if(typeof modules[moduleName].process == 'function'){
							modules[moduleName].process(bot, msg);
						}
					});
				})
				console.log(bot.config.name + ' started');
			});
		});
	});
});
