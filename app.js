var telegram = require('./telegram.js');
var regexAns = require('./regexAnswers.js');

var config = require('./config.json');

telegram.init(config.token, true, function(){
	telegram.onMessage(function(message){
		regexAns.process(message);
	})
	console.log('NerdBot started')
});
