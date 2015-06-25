var config = require('./config.json');
var telegram = require('./telegram.js');
var regexAns = require('./regexAnswers.js');

telegram.setToken(config.token);
telegram.discardUnreadMessages();

telegram.onMessage(function(message){
	regexAns.process(message);
})

console.log('NerdBot started')
