var request = require('request');

var token = false;
var highestId = false;

exports.setToken = function(t){
	token = t;
};

exports.api = function(call, callback){
	var method = call.method;
	var form = call;
	form.method = undefined;


	request.post({url: 'https://api.telegram.org/bot' + token + '/' + method, form: form}, function(error, response, body){
		if (!error && response.statusCode == 200) {
			apiResponseObj = JSON.parse(body);
			if(apiResponseObj.ok){
				if (typeof callback == 'function'){
					callback(apiResponseObj.result);
				}
			}
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

exports.onMessage = function(callback){
	setInterval(function(){getUpdates(callback)}, 1000);
}


exports.discardUnreadMessages = function(){
	getUpdates(function(){});
	getUpdates(function(){});
}
