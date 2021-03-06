//TODO babel: add plugin to make import work correctly
//TODO add babelrc to submodule
import * as fs from 'fs'
import * as path from 'path'
import * as EvEmtr from 'events'
import * as Lz from 'lazy.js'
import * as prmfy from 'promisify-node'
import * as req from 'request'
import mkAddr from './mkaddr.js'
import Cfg from './tgcfg.js'
import HkRcvr from './tghk-rcvr.js'
import HkReqr from './tghk-reqr.js'
//import from './tgmsg.js' //TODO integrate msgs

//TODO externalize O, Prm
const O = Object
const Prm = Promise

const addrBase = {
	protocol: 'https',
}

export default class Bot extends EvEmtr {
  //TODO show method visability using _-prefix

  static mk(...argz) {
    return new Bot().cfgr(...argz)
  }

  cfgr(cfg, start = true) {
		return new Prm((rsv)=> new Cfg({cfg}).on('done', (cfgp)=> {
			//TODO err handling (rjc)
	    O.assign(this, cfgp)

	    if (start) this.mkHook(); //TODO maybe wait for mkHook.then
	    rsv(this)
	  }))
  }

	mkHook() {
		const cfgBase = {bot: this}

		//TODO maybe move to cfgr
		this.hook = {
			reqr: new HkReqr(cfgBase),
		 	rcvr: new HkRcvr(cfgBase),
		}

		Lz(this.hook).each((e)=> e.start()) //TODO add promise
	}

  getPathN(...path) {
    return [
      '',
      'bot' + this.token,
    ].concat(path).join('/')
  }

  getHkAddrO() {
    return Lz(this).pick(['host', 'port']).assign({
      pathname: this.getPathN(),
    }).assign(addrBase)
  }

  getMethAddrO(meth) {
    return Lz({
      host: 'api.telegram.org',
      pathname: this.getPathN(meth),
    }).assign(addrBase)
  }

  req(meth, paramz = {}) {
    return new Prm((rsv, rjc)=> req.post({
      url: this.getMethAddrO(meth),
      json: paramz,
      gzip: true,
    }, (err, res, body)=> {
      if (err || 200 !== res.statusCode) return rjc(err || res)

      let bodyO
      try {
					//TODO Inform about Lz's Json capabilities and maybe parse lazy
          bodyO = JSON.parse(body)
      } catch (err2) {rjc(err2)}
      if (!body0 || !bodyO.ok) return rjc(bodyO)

      rsv(bodyO)
    }))
  }
}
