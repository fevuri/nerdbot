var async = require('async');

// Create the RegExp objects for all the regular expressions
exports.init = function(bot, done) {
	async.each(bot.config.modules.regexAnswers, function(answer, done){
		answer.regexObj = regexp = new RegExp(answer.regex, answer.flag);
		done();
	}, done);
}

// Check if a message matches a regex and reply if it does
exports.process = function(bot, message){
	async.each(bot.config.modules.regexAnswers, function(answer){
		if(answer.regexObj.test(message.text)){
			bot.sendMessage(message.chat.id, answer.answer);
		}
	});
};
