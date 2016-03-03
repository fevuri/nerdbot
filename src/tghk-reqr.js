//TODO find better enum syntax / write wrapper module
//TODO move to own module in order to be reused in rcvr
export const statez = {
  STARTN: Symbol(),
  STARTED: Symbol(),
  STOPPN: Symbol(),
  STOPPED: Symbol(),
}

export default class HkReqr {
  constructor() {

  }

  start() {
    this.state = statez.STARTN

		//TODO make it more safe by not using the bot token but a crypt string
		return this.req('setWebhook', {
			url: url.format(genHkAddrO),
			certificate: this.cert, //is stream
		}).then(this.onStart.bind(this))

    //TODO move to hook
    this.state = statez.STARTED
  }

  stop() {
    this.state = statez.STOPPN

	  stopHk() {
		  return this.req('setWebhook').then(this.onStop.bind(this))
	  }

    //TODO move to hook
    this.state = statez.STOPPED
  }
}
