exports.init = function(bot, done){
	var noSpam = bot.config.noSpam;
	done();
};

exports.process = function(bot, message){
	var noSpam = bot.config.noSpam;
	if(!noSpam.lastMessages){
		noSpam.lastMessages = {};
	}
	if(!noSpam.lastMessages[message.chat.id]){
		noSpam.lastMessages[message.chat.id] = new ChatHistory();
	}
	var lastMessagesInChat = noSpam.lastMessages[message.chat.id];
	if(noSpam.minuteLimit){
		var now = new Date();
		lastMessagesInChat.timestamps.push(now);
		lastMessagesInChat.timestamps = lastMessagesInChat.timestamps.filter(function(timestamp){
			return now.getTime() - timestamp.getTime() < 60*1000;
		});
		if(lastMessagesInChat.timestamps.length > noSpam.minuteLimit){
			bot.api({
				method: 'sendMessage',
				chat_id: message.chat.id,
				text: noSpam.reply
			});
		}
	}
};

function ChatHistory(){
	this.timestamps = [];
}
