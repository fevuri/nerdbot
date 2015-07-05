var async = require('async');

// Create the RegExp objects for all the regular expressions
exports.init = function(bot, done) {
	async.each(bot.config.regexAnswers, function(answer, done){
		answer.regexObj = regexp = new RegExp(answer.regex, answer.flag);
		done();
	}, done);
}

// Check if a message matches a regex and reply if it does
exports.process = function(bot, message){
	async.each(bot.config.regexAnswers, function(answer){
		if(answer.regexObj.test(message.text)){
			bot.api({
				method: 'sendMessage',
				chat_id: message.chat.id,
				text: answer.answer
			});
		}
	});
};
