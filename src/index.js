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

export default class Bot {
  //TODO show method visability using _-prefix

  static mk(...args) {
    return new Bot().cfgr(...args)
  }

  cfgr(cfg, start = true) {
    const prmPz = [
      'host',
      'port',
      'key',
      'cert',
      'ssl',
    ]
    const cfgp = Lz(cfg).pick(prmPz).map(Prm.resolve)
    .defaults(cfg).defaults({
      host: null,
      port: 8443,
    }) //TODO handle host, port etc. as promise, rewrite to do so
    //TODO automatically write key & cert to ssl if given
    //TODO don't let all cfg options be part of the this object

    if (null !== cfgp.host) return Prm.resolve(this)

    return new Prm((rsv, rjc)=> {
      new Prm((rsv2)=> {
        //TODO allow cert to be a string

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

  getPathN(...path) {
    return [
      '',
      'bot' + this.token,
    ].concat(path).join('/')
  }

  getHkAddrO() {
    return Lz(this).pick(['host', 'port']).assign({
      protocol: 'https',
      pathname: this.getPathN(),
    }
  }

  getMethAddrO(meth) {
    return {
      protocol: 'https',
      host: 'api.telegram.org',
      pathname: this.getPathN(meth),
    }
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
