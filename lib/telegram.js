var request = require('request');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var merge = require('merge');

// The bot objects (allows two different bots to run at the same time)
function Bot(token, config){
	this.token = token;
	this.config = config;
	this.highestId = 0;

	var self = this;

	// Discard messages by calling get updates twice in a row
	// at the first call 'highestId' will be set
	// at the second call the 'getUpdates' Api call will mark all previous messages as read
	// the second time is currently not necessary but will allow a smoother implementaion of the webhook
	if(config.discardUnreadMessages){
		this._pollOnce(false, function(){
			self._pollOnce(false, function(){
				meToObj();
			});
		});
	}else{
		meToObj();
	}

	function meToObj(){
		self.getMe(function(me){ // Set the bot.me object via getMe
			self.me = me;
			self._poll();
			self.emit('loaded');
		});
	}
}

util.inherits(Bot, EventEmitter);

// Make basic telegram api calls
// Call is a object containing a string 'method' and other named strings as parameters
// callback gets a the result object, that is inside of the response
Bot.prototype._api = function(method, args, callback, previousError){
	var self = this;
	request.post({url: 'https://api.telegram.org/bot' + this.token + '/' + method, form: args}, function(error, response, body){
		if (!error && response.statusCode == 200) {
			apiResponseObj = JSON.parse(body);
			if(apiResponseObj.ok){
				if(previousError) console.log("Connection working again");
				if(typeof callback == 'function'){
					callback(apiResponseObj.result);
				}
			}else{
				if(apiResponseObj.description != previousError) console.error('API Error: ' + apiResponseObj.description);
				setTimeout(function(){self._api(method, args, callback, apiResponseObj.description);}, 1000);
			}
		}else{
			var currentError;
			if(error){
				if(error.toString() != previousError) console.error('Server ' + error);
				currentError = error.toString();
			}else if(response && response.statusCode != 200){
				if(response.statusCode != previousError) console.error("Server Error: StatusCode " + response.statusCode);
				currentError = response.statusCode;
			}
			setTimeout(function(){self._api(method, args, callback, currentError);}, 1000);
		}
	});
};

Bot.prototype._pollOnce = function(emit, callback){
	var request = {};
	if(this.highestId != 0){
		request.offset = this.highestId + 1;
	}
	var self = this;
	this.getUpdates(request, function(response){
		response.forEach(function(update){
			if(self.highestId < update.update_id) self.highestId = update.update_id;
			if(emit) self.emit('message', update.message);
		});
		if(typeof callback == 'function'){
			callback();
		}
	});
}

Bot.prototype._poll = function(){
	var self = this;
	this._pollOnce(true, function(){
		self._poll();
	});
}

// API Mehtods

Bot.prototype.getMe = function(callback) {
	this._api('getMe', null, callback);
};

Bot.prototype.sendMessage = function(chat_id, text, optArgs) {
	var args = {
		chat_id: chat_id,
		text: text
	}
	this._api('sendMessage', merge(args, optArgs));
};

Bot.prototype.forwardMessage = function(chat_id, from_chat_id, message_id) {
	var args = {
		chat_id: chat_id,
		from_chat_id: from_chat_id,
		message_id: message_id
	}
	this._api('forwardMessage', args);
};

Bot.prototype.getUpdates = function(args, callback) {
	this._api('getUpdates', args, callback);
};

module.exports = Bot;
