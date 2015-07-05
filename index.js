var async = require('async');

var telegram = require('./lib/telegram.js');
var modules = {
	regexAnswers: require('./lib/regexAnswers.js'),
	noSpam: require('./lib/noSpam.js'),
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
			bot.on('message', function(message){
				// If a message is received, pass it to all activeated modules
				async.each(bot.config.activeModules, function(moduleName){
					if(typeof modules[moduleName].process == 'function'){
						modules[moduleName].process(bot, message);
					}
				});
			})
			console.log(bot.config.name + ' started')
		});
	});
});
