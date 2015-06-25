var telegram = require('./telegram.js');
var conf = require('./regexConf.json');

exports.process = function(message){
	conf.answers.forEach(function(answer){
		var regexp = new RegExp(answer.regex, 'i');

		if(regexp.test(message.text)){
			telegram.api({
				method: 'sendMessage',
				chat_id: message.chat.id,
				text: answer.answer
			});
		}
	});
};
