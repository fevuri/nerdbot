var request = require('request');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var merge = require('merge');

// The bot objects (allows two different bots to run at the same time)
// TODO: Only one timer for all bot objects
function Bot(token, config, done){
	this.token = token;
	this.config = config;
	this.highestId = 0;

	// Discard messages by calling get updates twice in a row
	// at the first call 'highestId' will be set
	// at the second call the 'getUpdates' Api call will mark all previous messages as read
	// the second time is currently not necessary but will allow a smoother implementaion of the webhook
	if(config.discardUnreadMessages){
		var _this = this;
		this._getUpdates(false, function(){
			_this._getUpdates(false, function(){
				_this._poll();
				done(_this);
			});
		});
	}else{
		this._poll();
		done(this);
	}
}

util.inherits(Bot, EventEmitter);

// Make basic telegram api calls
// Call is a object containing a string 'method' and other named strings as parameters
// callback gets a the result object, that is inside of the response
Bot.prototype._api = function(call, callback, previousError){
	var method = call.method;
	var form = merge(true, call);
	form.method = undefined; //set method to undefined so that it wont be submitted as a parameter

	var _this = this;
	request.post({url: 'https://api.telegram.org/bot' + this.token + '/' + method, form: form}, function(error, response, body){
		if (!error && response.statusCode == 200) {
			apiResponseObj = JSON.parse(body);
			if(apiResponseObj.ok){
				if(previousError) console.log("Connection working again");
				if(typeof callback == 'function'){
					callback(apiResponseObj.result);
				}
			}else{
				if(apiResponseObj.description != previousError) console.error('API Error: ' + apiResponseObj.description);
				setTimeout(function(){_this._api(call, callback, apiResponseObj.description);}, 1000);
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
			setTimeout(function(){_this._api(call, callback, currentError);}, 1000);
		}
	});
};

Bot.prototype._getUpdates = function(emit, callback){
	var request = {method: 'getUpdates'};
	if(this.highestId != 0){
		request.offset = this.highestId + 1;

	}
	var _this = this;
	this._api(request, function(response){
		response.forEach(function(update){
			if(_this.highestId < update.update_id) _this.highestId = update.update_id;
			if(emit) _this.emit('message', update.message);
		});
		if(typeof callback == 'function'){
			callback();
		}
	});
}

Bot.prototype._poll = function(){
	var _this = this;
	this._getUpdates(true, function(){
		_this._poll();
	});
}

// API Mehtods

Bot.prototype.getMe = function(callback) {
	this._api({method: 'getMe'}, callback);
};

Bot.prototype.sendMessage = function(chat_id, text, args) {
	var apiCall = {
		method: 'sendMessage',
		chat_id: chat_id,
		text: text
	}
	this._api(merge(apiCall, args));
};

Bot.prototype.forwardMessage = function(chat_id, from_chat_id, message_id) {
	var apiCall = {
		method: 'forwardMessage',
		chat_id: chat_id,
		from_chat_id: from_chat_id,
		message_id: message_id
	}
	this._api(apiCall);
};

module.exports = Bot;
