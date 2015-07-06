exports.process = function(bot, msg){
    if(msg.chat.id == msg.from.id && msg.chat.id != bot.config.forwarder.forwardTo) bot.forwardMessage(bot.config.forwarder.forwardTo, msg.chat.id, msg.message_id);
}
