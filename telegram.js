var request = require('request');

// Initialize the telegram api (discard messages if wanted) and call the callback after it is finished
exports.init = function(token, discardUnreadMessages, callback){
	bot = new Bot(token);

	// Discard messages by calling get updates twice in a row
	// at the first call 'highestId' will be set
	// at the second call the 'getUpdate' Api call will mark all previous messages as read
	// the second time is currently not necessary but will allow a smoother implementaion of the webhook
	if(discardUnreadMessages){
		bot.getUpdates(null, function(){
			bot.getUpdates(null, function(){
				callback(bot);
			});
		});
	}else{
		callback(bot);
	}
}


// The bot objects (allows two different bots to run at the same time)
// TODO: Only one timer for all bot objects
function Bot(token){
	this.token = token;
	this.highestId = 0;

	// Make basic telegram api calls
	// Call is a object containing a string 'method' and other named strings as parameters
	// callback gets a the result object, that is inside of the response
	this.api = function(call, callback){
		var method = call.method;
		var form = call;
		form.method = undefined; //set method to undefined so that it wont be submitted as a parameter

		request.post({url: 'https://api.telegram.org/bot' + this.token + '/' + method, form: form}, function(error, response, body){
			if (!error && response.statusCode == 200) {
				apiResponseObj = JSON.parse(body);
				if(apiResponseObj.ok){
					if (typeof callback == 'function')
						callback(apiResponseObj.result);
				}else{
					console.log('API Error:');
					console.log(apiResponseObj.description);
				}
			}else{
				console.log('Server Error');
			}
		});
	};

	this.getUpdates = function(callback1, callback2){
		var request = {method: 'getUpdates'};
		if(this.highestId != 0){
			request.offset = this.highestId + 1;

		}
		_this = this
		this.api(request, function(response){
			response.forEach(function(update){
				if(_this.highestId < update.update_id){
					_this.highestId = update.update_id;
				}
				if (typeof callback1 == 'function')
					callback1(update.message);
			});
			if (typeof callback2 == 'function')
				callback2();
		});
	}

	// Calls the callback funtion everytime a new message is received
	// TODO: Optimize by implementing the Webhook if supported by the environment
	var _this = this;
	this.onMessage = function(callback){
		setInterval(function(){
			_this.getUpdates(callback);
		}, 1000);
	}
}
