import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as extjs from 'external-ip'
import * as tg from './lib/telegram.js'
import * as wh from './lib/webhook.js'

const O = Object
const Prm = Promise

function getOsHost() {
	const host = os.hostname()
	return 'localhost' !== host && host
}

export default class Bot {
	contructor() {
	})

	cfgr(cfg) {
		return new Prm((rsv, rjc)=> {
			// TODO put addr getter in own module
			new Prm((rsv2, rjc2)=> {
				const cfgp = O.assign(O.seal({
					host = null,
					port = 8443,
				}), cfg)

				if (!O.is(null, cfg.host)) {
					rsv2(cfgp)
				} else {
					const osHost = getOsHost()

					(osHost ? Prm.resolve(osHost) : new Prm((rsv3, rjc3)=>
						extjs()((err, extHost)=>
							// intended that it's `rjc`, not `rjc3`
							err ? rjc(err) : rsv3(extHost)
						)
					)).then((host)=>
						rsv2(O.assign(cfgp, {host}))
					)
				}
			}).then((cfgp)=>
				rsv(O.assign(this, cfgp, {
					addr: url.format(O.assign({
						protocol: 'https',
					}, cfgp)),
				}))
			)
		})
	}
//Webhooks
if (fs.existsSync(path.resolve(__dirname, "webhook.json"))){
	webhook.setup(require("./webhook.json"));
}

// Load all existing botmodules
var botmodules = {};
// read all files from the botmodules folder and loop through them
fs.readdirSync(path.resolve(__dirname, 'botmodules')).forEach(function(modulefilename){
	var modulepath = path.resolve(__dirname, 'botmodules', modulefilename); //get the absolute path to the module
	if(path.extname(modulepath) == '.js'){
		var modulename = path.basename(modulepath, '.js'); // get the name of the module (the filename minus '.js')
		botmodules[modulename] = require(modulepath);
		console.log(modulename + " loaded");
	}
	// TODO: handle folders as botmodules
});

// Start the different Bots
async.each(config.bots, function(botConfig){
	new telegram(apikeys[botConfig.username], botConfig, webhook)
	// set the on loaded function to initialize the botmodules
	.on('loaded', function(){
		var self = this;
		// Initialize every module of the bot
		async.each(Object.keys(this.config.modules), function(moduleName, done){
			if(botmodules[moduleName] && typeof botmodules[moduleName].init == 'function'){
				botmodules[moduleName].init(self, done);
			}else{
				done();
			}
		},
		// When the initialization of the modules is finished, log the start
		function(){
			if(self.me.username.toUpperCase() != self.config.username.toUpperCase()) console.info("Warning: %s has a different username ('%s' expected, returned '%s')", self.config.username, self.config.username, self.me.username);
			console.log('%s started', self.config.username);
		});
	})
	// set the on message function to handle incoming messages
	.on('message', function(msg){
		var self = this;
		// If a message is received, pass it to all activeated modules
		async.each(Object.keys(this.config.modules), function(moduleName){
			if(botmodules[moduleName] && typeof botmodules[moduleName].process == 'function'){
				botmodules[moduleName].process(self, msg);
			}
		});
	});
});
}
