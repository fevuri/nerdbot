const prmPz = [
  'host',
  'port',
  'key',
  'cert',
  'ssl',
]

//TODO rewrite as class
export default function genCfg(cfg) {
  const cfgp = Lz(cfg).pick(prmPz).map(Prm.resolve.then())
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
    })
  })
}
