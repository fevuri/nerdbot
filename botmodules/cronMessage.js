var async = require('async');
var CronJob = require('cron').CronJob;

// Create the Cronjobs
exports.init = function (bot, done) {
	async.each(bot.config.modules.cronMessage, function (job, done) {
		new CronJob(job.cron, function(){
			bot.sendMessage(job.chat_id, job.text);
		}).start();
		done();
	}, done);
};
