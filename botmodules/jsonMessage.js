exports.process = function (bot, msg) {
	bot.reply(msg, '```' + JSON.stringify(msg, null, 4) + '```', true);
};
