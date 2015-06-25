var async = require('async');

var telegram = require('./telegram.js');
var conf = require('./regexConf.json');

conf.answers.forEach(function(answer){
	answer.regexObj = regexp = new RegExp(answer.regex, answer.flag);
});

exports.process = function(message){
	async.each(conf.answers, function(answer, callback){
		if(answer.regexObj.test(message.text)){
			telegram.api({
				method: 'sendMessage',
				chat_id: message.chat.id,
				text: answer.answer
			});
		}
		callback();
	});
};
