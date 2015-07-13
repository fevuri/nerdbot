var async = require('async');

// Create the RegExp objects for all the regular expressions
exports.init = function(bot, done) {
	async.each(bot.config.modules.regexReplies, function(reply, done){
		reply.regexObj = regexp = new RegExp(reply.regex, reply.flag);
		done();
	}, done);
}

// Check if a message matches a regex and reply if it does
exports.process = function(bot, message){
	async.each(bot.config.modules.regexReplies, function(reply){
		if(reply.regexObj.test(message.text)){
			bot.sendMessage(message.chat.id, reply.reply);
		}
	});
};
