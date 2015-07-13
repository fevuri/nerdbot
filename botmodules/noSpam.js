var async = require('async');

exports.process = function(bot, message){
	var noSpam = bot.config.modules.noSpam; // helper variable
	// create the lastMessages and ChatHistory objects for the chat if they dont exist
	if(!noSpam.lastMessages) noSpam.lastMessages = {};
	if(!noSpam.lastMessages[message.chat.id]) noSpam.lastMessages[message.chat.id] = new ChatHistory();
	function ChatHistory(){
		this.timestamps = [];
		this.lastText = {
			text: "",
			count: 0,
		}
	}
	var lastMessagesInChat = noSpam.lastMessages[message.chat.id]; // helper variable

	// async.some to check if one of the different spam filters is true
	async.some([
		// too many replys in a minute
		function(){
			if(noSpam.minuteLimit){
				var now = new Date();
				lastMessagesInChat.timestamps.push(now);
				lastMessagesInChat.timestamps = lastMessagesInChat.timestamps.filter(function(timestamp){
					return now.getTime() - timestamp.getTime() < 60*1000;
				});
				if(lastMessagesInChat.timestamps.length > noSpam.minuteLimit) return true;
			}
			return false;
		},
		// too often the same content
		function(){
			if(message.text){
				if(message.text == lastMessagesInChat.lastText.text){
					lastMessagesInChat.lastText.count++;
					if(lastMessagesInChat.lastText.count > noSpam.sameTextLimit) return true;
				}else{
					lastMessagesInChat.lastText.text = message.text;
					lastMessagesInChat.lastText.count = 1;
				}
			}else{
				lastMessagesInChat.lastText.text = "";
				lastMessagesInChat.lastText.count = 1;
			}
			return false;
		}],
		function(func, callback){callback(func())}, // mini function to call the functions of the array and pass their result to callback
		function(reuslt){
			// reply if one of the spam filters are true
			if(reuslt){
				bot.sendMessage(noSpam.publicReply ? message.chat.id : message.from.id, noSpam.reply);
			}
		}
	);
};
