var fs = require('fs');
var exp = require('express')();
var https = require('https');
var crypto = require('crypto');
var base64url = require('base64url');
var path = require('path');
var request = require('request');
var bodyParser = require('body-parser');

var webhook = {
	enabled: false,
	bots: [],
};

webhook.setup = function (config) {
	webhook.config = config;

	var httpsOptions = {
		key: fs.readFileSync(path.resolve(__dirname, '..', config.ssl.keypath)),
		cert: fs.readFileSync(path.resolve(__dirname, '..', config.ssl.certpath))
	};

	https.createServer(httpsOptions, exp).listen(config.port);

	webhook.enabled = true;
	webhook.token = base64url(crypto.randomBytes(32));

	exp.use(bodyParser.json());

	exp.post('/' + webhook.token + '/:id', function (req, res) {
		webhook.bots[req.params.id].emit('message', req.body.message);
	  	res.sendStatus(200);
	});
};

webhook.initBot = function (bot, callback) {
	var botIndex = webhook.bots.push(bot) -1;
	var webhookURL = 'https://' + webhook.config.ip + ':' + webhook.config.port + '/' + webhook.token + '/' + botIndex;
	var certpath = path.resolve(__dirname, '..', webhook.config.ssl.certpath);

	var APIurl = 'https://api.telegram.org/bot' + bot.token + '/setWebhook';

	var req = request.post(APIurl, function (err, resp, body) {
		//TODO: Error handling
		console.log("%s: Webhook activated", bot.config.username);
		callback();
	});
	var form = req.form();
	form.append('certificate', fs.createReadStream(certpath));
	form.append('url', webhookURL);

};


module.exports = webhook;
