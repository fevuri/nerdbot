var request = require('request');

var token = false;
var highestId = false;

exports.setToken = function(t){
	token = t;
};

// Make basic telegram api calls
// Call is a object containing a string 'method' and other named strings as parameters
// callback gets a the result object, that is inside of the response
exports.api = function(call, callback){
	var method = call.method;
	var form = call;
	form.method = undefined; //set method to undefined so that it wont be submitted as a parameter

	request.post({url: 'https://api.telegram.org/bot' + token + '/' + method, form: form}, function(error, response, body){
		if (!error && response.statusCode == 200) {
			apiResponseObj = JSON.parse(body);
			if(apiResponseObj.ok){
				if (typeof callback == 'function'){
					callback(apiResponseObj.result);
				}
			}else{
				console.log('API Error:');
				console.log(apiResponseObj.description);
			}
		}else{
			console.log('Server Error');
		}
	});
};

getUpdates = function(callback){
	var request = {method: 'getUpdates'};
	if(highestId){
		request.offset = highestId + 1;
	}
	exports.api(request, function(response){
		response.forEach(function(update){
			if(highestId < update.update_id){
				highestId = update.update_id
			}
			callback(update.message);
		});
	});
}

// Calls the callback funtion everytime a new message is received
// TODO: Optimize by implementing the Webhook if supported by the environment
exports.onMessage = function(callback){
	setInterval(function(){getUpdates(callback)}, 1000);
}

// Litte helper function that calls getUpdates with and empty callback twice
// in order not to react on messages that were sent before the bot is started
exports.discardUnreadMessages = function(){
	getUpdates(function(){});
	getUpdates(function(){});
}
