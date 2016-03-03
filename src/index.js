import * as fs from 'fs'
import * as path from 'path'
import * as EvEmtr from 'events'
import * as Lz from 'lazy.js'
import * as prmfy from 'promisify-node'
import * as req from 'request'
import mkAddr from './mkaddr.js'
import HkRcvr from './tghk-rcvr.js'
import genCfg from './tgcfg.js'
//import from './tgmsg.js' //TODO integrate msgs

const O = Object
const Prm = Promise

const addrBase = {
	protocol: 'https'
}

export default class Bot {
  //TODO show method visability using _-prefix

  static mk(...args) {
    return new Bot().cfgr(...args)
  }

  cfgr(cfg, start = true) {
		return new Prm((rsv)=> genCfg(cfg).then((cfgp)=> {
	    O.assign(this, cfgp)

	    if (start) this.mkHook();
	    rsv(this)
	  }))
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
          bodyO = JSON.parse(body)
      } catch (err2) {rjc(err2)}
      if (!body0 || !bodyO.ok) return rjc(bodyO)

      rsv(bodyO)
    }))
  }
}
