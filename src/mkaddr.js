import * as os from 'os'
import * as ext from 'external-ip'

const O = Object
const Prm = Promise

export default function mkAddr() {
  const osHost = getOsHost()

  return osHost ? Prm.resolve(osHost) : new Prm((rsv)=>
    ext()((err, extHost)=>
      err ? rjc(err) : rsv(extHost)
    )
  )

  //TODO reintegrate to index.js
}

export function getOs() {
	const host = os.hostname()
	return 'localhost' === host ? host : null
}
