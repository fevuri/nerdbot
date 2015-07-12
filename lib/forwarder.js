exports.process = function(bot, msg){
    if(msg.chat.id == msg.from.id && msg.chat.id != bot.config.modules.forwarder.forwardTo) bot.forwardMessage(bot.config.modules.forwarder.forwardTo, msg.chat.id, msg.message_id);
    if(msg.chat.id == bot.config.modules.forwarder.forwardTo && msg.reply_to_message && msg.text){
        bot.sendMessage(msg.reply_to_message.forward_from.id, msg.text);
    }
}
