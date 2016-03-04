//TODO migrate to bacon.js (or similar library)

//TODO make this class also usable for other purposes -> move following stuff to index.js
const prmPz = [
  'host',
  'port',
  'key',
  'cert',
  'ssl',
]
const dflts = [
  port: 8443,
]

function func2Prm(func) {
  return new Prm((rsv, rjc)=> func((err, data)=> err ? rjc(err) : rsv(data)))
}

export default class Cfg extends EvEmtr {
  constructor(cfg) {
    const prmCfg = Lz(cfg).pick(prmPz)
    const funcCfg = prmCfg.pick(prmCfg.functions())
    this.prmz = funcCfg.map(func2Prm).defaults(prmCfg)
    //TODO Don't fire when everything is done but tigger different events specifically
    //TODO Save cfg data to instances of this class
    Prm.all(this.prmz.values()).then(()=> this.emit('done', this.prmz))
  }
}

//TODO rewrite as class
export default function genCfg(cfg) {
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
