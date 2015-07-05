exports.init = function(bot, done){
	var noSpam = bot.config.noSpam;
	done();
};

exports.process = function(bot, message){
	var noSpam = bot.config.noSpam; // helper variable
	// create the lastMessages and ChatHistory objects for the chat if they dont exist
	if(!noSpam.lastMessages) noSpam.lastMessages = {};
	if(!noSpam.lastMessages[message.chat.id]) noSpam.lastMessages[message.chat.id] = new ChatHistory();
	function ChatHistory(){
		this.timestamps = [];
	}
	var lastMessagesInChat = noSpam.lastMessages[message.chat.id]; // helper variable

	// answer if there are to many replys in a minute
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
	//TODO limit messages with same text, maybe some kind of asyc implementation
};
