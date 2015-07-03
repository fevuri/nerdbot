var telegram = require('./telegram.js');
var regexAns = require('./regexAnswers.js');

var config = require('./config.json');

telegram.init(config.nerdbot.token, true, function(bot){
	bot.onMessage(function(message){
		regexAns.process(bot, message);
	})
	console.log('NerdBot started')
});
