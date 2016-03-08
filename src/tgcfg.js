//TODO migrate to bacon.js or/and highland.js (or similar libraries)
import * as EvEmtr from 'events'
import * as Lz from 'lazy.js'
import * as Hl from 'highland'

const O = Object
const Prm = Promise

//TODO make this class also usable for other purposes -> move following stuff to index.js
const accept = Lz({
  host: [Prm, String],
  port: [Prm, Number],
  key: [Prm, String],
  cert: [Prm, String],
  ssl: [Prm, O],
})
const dfltz = Lz({
  port: 8443,
})
const prmKeyz = accept.filter((val)=> val.includes(Prm)).keys() //TODO test if .filter() outputs OLikeSeq

function func2Prm(func) {
  return new Prm((rsv, rjc)=> func((err, data)=> err ? rjc(err) : rsv(data)))
}

function strm2Prm(strm) {
  return new Prm((rsv, rjc)=> Hl(strm).reduce1((l, r)=> l + r)).apply(rsv))
  })
}

export default class Cfg extends EvEmtr {
  constructor(arg) {
    O.assign(this, Lz(Lz(arg).pick(['dfltz', 'accept']).assign({i: arg.cfg}))
  }

  //TODO implement getter cache
  get prmz() {
    const prmCfg = this.i.pick(prmKeyz)
    const strmCfg = prmCfg.
    const funcCfg = prmCfg.pick(prmCfg.functions())

    const strmCfgP = strmCfg.map(strm2Prm)
    const funcCfgP = funcCfg.map(func2Prm)

    return strmCfg.defaults(funcCfgP).defaults(prmCfg)
  }

  get parsedz() {
    //TODO test accept's type asserts
    return this.i.pick(accept.keys())
  }

  get dfltedz() {
    return this.parsedz.defaults(dfltz)
  }

  get o() {
    return this.rsvedz.defaults(this.simplz)
  }

  //TODO Put in different funcs
  mk() {
    //TODO Don't fire when everything is done but tigger different events specifically
    //TODO Find out: Do i rly need values() or are OLikeSeqs iterable
    //TODO Err handling
    Prm.all(this.prmz.values()).then((vals)=> this.emit('done', O.assign(this, {
      rsvedz: Lz(this.prmz.keys().zip(vals).toObject()) //TODO cleaner way? maybe in bacon
    })))
  }
}

//TODO check if it does the same as the class and rm then
function genCfg(cfg) {
  const cfgp = prmCfg
  .pick(prmCfg.functions())
  .map(func2Prm)
  .defaults(prmCfg)
  .map()
  .defaults(cfg)
  .defaults({
    host: null,
    port: 8443,
  }) //TODO handle host, port etc. as promise, rewrite to do so
  //TODO automatically write key & cert to ssl if given
  //TODO don't let all cfg options be part of the this object
  //TODO externalize prm handling

  if (null !== cfgp.host) return Prm.resolve(this)

  return new Prm((rsv, rjc)=> {
    new Prm((rsv2)=> {
      //TODO allow cert to be a string

      if (null !== cfg.host) {
        rsv2(cfgp)
      } else {
        //TODO update mkAddr on connection errs
        mkAddr().then((host)=> rsv2(O.assign(cfgp, {host})))
      }
    })
  })
}
