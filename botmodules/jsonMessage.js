exports.process = function(bot, msg){
    bot.sendMessage(msg.chat.id, JSON.stringify(msg, null, 4));
}
