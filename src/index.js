import * as fs from 'fs'
import * as path from 'path'
import * as EvEmtr from 'events'
import * as Lz from 'lazy.js'
import * as prmfy from 'promisify-node'
import * as req from 'request'
import mkAddr from './mkaddr.js'
import HkRcvr from './tghk-rcvr.js'

const O = Object
const Prm = Promise

//TODO implement EventEmitter
export default class Bot extends EvEmtr {
	//TODO show method visability using _-prefix

	static mk(...args) {
		return new Bot().cfgr(...args)
	}

	cfgr(cfg, start = true) {
		const prmPz = [
			'host',
			'port',
			'key',
			'ssl'
		]

		return new Prm((rsv, rjc)=> {
			new Prm((rsv2)=> {
				//TODO allow cert to be a string
				const cfgp = Lz(cfg).pick(prmPz).map(Prm.resolve).defaults(cfg).defaults({
					host: null,
					port: 8443,
				})

				if (null !== cfg.host) {
					rsv2(cfgp)
				} else {
					mkAddr().then((host)=> rsv2(O.assign(cfgp, {host})))
				}
			}).then((cfgp)=>
				O.assign(this, cfgp)

				if (start) this.mkHook();
				rsv(this)
			)
		})
	}

	genPathN(...path) {
		return [
			'',
			'bot' + this.token,
		].concat(path).join('/')
	}

	genHkAddrO() {
		return Lz(this).pick(['host', 'port']).assign({
			protocol: 'https',
			pathname: this.genPathN(),
		}
	}

	genMethAddrO(meth) {
		return {
			protocol: 'https',
			host: 'api.telegram.org',
			pathname: this.genPathN(meth),
		}
	}

	// TODO externalize
	req(meth, paramz = {}) {
		return new Prm((rsv, rjc)=> req.post({
			url: this.genMethAddrO(meth),
			json: paramz,
			gzip: true,
		}, (err, res, body)=> {
			if (err || 200 !== res.statusCode) return rjc(err || res)

			let bodyO
			try {
					bodyO = JSON.parse(body)
			} catch (err2) {rjc(err2)}

			// externalize till here
			if (!bodyO.ok) return rjc(bodyO)

			rsv(bodyO)
		}))
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
