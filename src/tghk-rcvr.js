//TODO add express etc. to dependencies
import * as EvEmtr from 'events'
import * as https from 'https'
import * as bparser from 'body-parser'
import * as express from 'express'
import statez from './statez.js'

const O = Object
const Prm = Promise

export default class HkRcvr {
  constructor({
    bot
  }) {
    O.assign(this, {
      app: express()
      .use(bparser.json({strict: true}))
      .post(this.bot.getPathN(':id'), (req, res)=> {
        this.emit('msg')
        res.sendStatus(200)
      }),
      bot,
    })

  }

  start() {
    https.createServer(this.bot.ssl, this.app).listen(this.bot.port)
    this.state = statez.STARTED
    return Prm.resolve(this)
  }

  stop() {
    this.server.close()
    this.state = statez.STOPPED
    return Prm.resolve(this)
  }
}
