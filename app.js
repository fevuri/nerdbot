var async = require('async');

var telegram = require('./telegram.js');
var modules = {
	regexAnswers: require('./regexAnswers.js'),
	noSpam: require('./noSpam.js'),
};

var apikeys = require('./apikeys.json');
var config = require('./config.json');


async.each(config.bots, function(botConfig, callback){
	telegram.init(apikeys[botConfig.name], botConfig, function(bot){
		bot.onMessage(function(message){
			async.each(bot.config.activeModules, function(moduleName, callback){
				modules[moduleName].process(bot, message);
			});
		})
		console.log(bot.config.name + ' started')
	});
	callback();
});
