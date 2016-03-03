import * as os from 'os'
import * as extjs from 'external-ip'

const O = Object
const Prm = Promise

export default function mkAddr() {
  const osHost = getOsHost()

  //TODO return prm
  osHost ? Prm.resolve(osHost) : new Prm((rsv)=>
    extjs()((err, extHost)=>
      err ? rjc(err) : rsv(extHost)
    )
  )).then((host)=>
    rsv2(O.assign(cfgp, {host}))
  )
}

export function getOs() {
	const host = os.hostname()
	return 'localhost' === host ? host : null
}
