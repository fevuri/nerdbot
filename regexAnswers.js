var async = require('async');

var telegram = require('./telegram.js');
var conf = require('./regexConf.json');

// Create the RegExp objects for all the regular expressions
conf.answers.forEach(function(answer){
	answer.regexObj = regexp = new RegExp(answer.regex, answer.flag);
});

// Check if a message matches a regex and reply if it does
exports.process = function(bot, message){
	async.each(conf.answers, function(answer, callback){
		if(answer.regexObj.test(message.text)){
			bot.api({
				method: 'sendMessage',
				chat_id: message.chat.id,
				text: answer.answer
			});
		}
		callback();
	});
};
