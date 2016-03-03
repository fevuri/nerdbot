import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as extjs from 'external-ip'
import * as Lz from 'lazy.js'
import * as prmfy from 'promisify-node'
import * as oReq from 'request'
import * as tg from './lib/telegram.js'
import * as wh from './lib/webhook.js'

const O = Object
const Prm = Promise
const req = prmfy(oReq)

function getOsHost() {
	const host = os.hostname()
	return 'localhost' !== host && host
}

export default class Bot {
	static mk(cfg) {
		return new Bot().cfgr(cfg)
	}

	cfgr(cfg) {
		const prmPz = [
			'host',
			'port',
			'key',
			'cert',
			'ssl'
		]

		return new Prm((rsv, rjc)=> {
			// TODO put addr getter in own module
			new Prm((rsv2, rjc2)=> {
				const cfgp = Lz(cfg).pick(prmPz).map(Prm.resolve).defaults(cfg).defaults({
					host: null,
					port: 8443,
				})

				if (!O.is(null, cfg.host)) {
					rsv2(cfgp)
				} else {
					const osHost = getOsHost()

					osHost ? Prm.resolve(osHost) : new Prm((rsv3, rjc3)=>
						extjs()((err, extHost)=>
							// intended that it's `rjc`, not `rjc3`
							err ? rjc(err) : rsv3(extHost)
						)
					)).then((host)=>
						rsv2(O.assign(cfgp, {host}))
					)
				}
			}).then((cfgp)=>
				rsv(O.assign(this, cfgp))
			)
		})
	}

	getHkAddr() {
		return url.format(Lz(this).pick(['host', 'port']).assign({
			protocol: 'https',
			pathname: 'bot' + this.token,
		}))
	}

	getMethAddr(meth) {
		return url.format({
			protocol: 'https',
			host: 'api.telegram.org',
			pathname:  [
				'bot' + this.token,
				meth,
			].join('/'),
		})
	}
}

//TODO put in own module(s)
class Chat {

}

class Msg {
	{
		content: null, //required
		notify: true,
		kbd: null,
	}
}

class Content {
	{
	}
}

class Txtd extends Content {
	{
		text: null, //required
	}
}

class Text extends Txtd {
	{
		parser: null,
		preview: true,
	}
}

class Media extends Content {
	{
		media,
	}
}

class Sticker extends Content {

}

class Contact extends Content {

}

class Loc extends Msg {

}
