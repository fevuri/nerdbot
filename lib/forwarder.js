exports.process = function(bot, msg){
    if(msg.chat.id == msg.from.id && msg.chat.id != bot.config.forwarder.forwardTo) bot.forwardMessage(bot.config.forwarder.forwardTo, msg.chat.id, msg.message_id);
    if(msg.chat.id == bot.config.forwarder.forwardTo && msg.reply_to_message && msg.text){
        bot.sendMessage(msg.reply_to_message.forward_from.id, msg.text);
    }
}
