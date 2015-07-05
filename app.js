var async = require('async');

var telegram = require('./telegram.js');
var modules = {
	regexAnswers: require('./regexAnswers.js'),
	noSpam: require('./noSpam.js'),
};

var apikeys = require('./apikeys.json');
var config = require('./config.json');


async.each(config.bots, function(botConfig){
	telegram.init(apikeys[botConfig.name], botConfig, function(bot){
		async.each(bot.config.activeModules, function(moduleName, done){
			if(typeof modules[moduleName].init == 'function'){
				modules[moduleName].init(bot, done);
			}else{
				done();
			}
		}, function(){
			bot.onMessage(function(message){
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
