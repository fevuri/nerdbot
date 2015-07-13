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
				if(previousError) console.log("%s: Connection working again", self.config.username);
				if(typeof callback == 'function'){
					callback(apiResponseObj.result);
				}
			}else{
				if(apiResponseObj.description != previousError) console.error('%s: API Error: %s', self.config.username, apiResponseObj.description);
				setTimeout(function(){self._api(method, args, callback, apiResponseObj.description);}, 1000);
			}
		}else{
			var currentError;
			if(error){
				if(error.toString() != previousError) console.error('%s: Connection %s', self.config.username, error);
				currentError = error.toString();
			}else if(response && response.statusCode != 200){
				if(response.statusCode != previousError) console.error("%s: Server Error: StatusCode %s", self.config.username, response.statusCode);
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

Bot.prototype.sendPhoto = function(chat_id, photo, optArgs) {
	var args = {
		chat_id: chat_id,
		photo: photo
	}
	this._api('sendPhoto', merge(args, optArgs));
};

Bot.prototype.sendAudio = function(chat_id, audio, optArgs) {
	var args = {
		chat_id: chat_id,
		audio: audio
	}
	this._api('sendAudio', merge(args, optArgs));
};

Bot.prototype.sendDocument = function(chat_id, document, optArgs) {
	var args = {
		chat_id: chat_id,
		document: document
	}
	this._api('sendDocument', merge(args, optArgs));
};

Bot.prototype.sendSticker = function(chat_id, sticker, optArgs) {
	var args = {
		chat_id: chat_id,
		sticker: sticker
	}
	this._api('sendSticker', merge(args, optArgs));
};

Bot.prototype.sendVideo = function(chat_id, video, optArgs) {
	var args = {
		chat_id: chat_id,
		video: video
	}
	this._api('sendVideo', merge(args, optArgs));
};

Bot.prototype.sendLocation = function(chat_id, latitude, longitude, optArgs) {
	var args = {
		chat_id: chat_id,
		latitude: latitude,
		longitude: longitude
	}
	this._api('sendLocation', merge(args, optArgs));
};

Bot.prototype.sendChatAction = function(chat_id, action) {
	var args = {
		chat_id: chat_id,
		action: action
	}
	this._api('sendChatAction', args);
};

Bot.prototype.getUserProfilePhotos = function(user_id, optArgs, callback) {
	var args = {
		user_id: user_id
	}
	this._api('getUserProfilePhotos', merge(args, optArgs), callback);
};

Bot.prototype.getUpdates = function(args, callback) {
	this._api('getUpdates', args, callback);
};

Bot.prototype.setWebhook = function(url) {
	var args ={
		url: url
	}
	this._api('setWebhook', args);
};

// Most of the time the bot needs to reply to a message with some content
Bot.prototype.reply = function(msg, reply, isReply) {
	var apiCall = '';
	var apiArgs = {};
	if(typeof reply === 'string'){
		apiCall = 'sendMessage';
		apiArgs = {text: reply};
	}else if(typeof reply === 'object'){
		var type = Object.keys(reply)[0];
		if(reply.type) type = reply.type;
		apiCall = 'send' + type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
		apiArgs = merge(true, reply);
		apiArgs.type = undefined;
	}
	apiArgs.chat_id = msg.chat.id;
	if(isReply) apiArgs.reply_to_message_id = msg.message_id;
	this._api(apiCall, apiArgs);
};

module.exports = Bot;
