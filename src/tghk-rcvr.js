//TODO add express etc. to dependencies
import * as EvEmtr from 'events'
import * as bparser from 'body-parser'
import * as express from 'express'

const O = Object
const Prm = Promise

export default class HkRcvr extends EvEmtr {
  constructor({
    bot
  }) {
    Object.assign(this, {
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
    this.server = this.app.listen(this.bot.port)
    //TODO use statez
    this.state = true
  }

  stop() {
    this.server.close()
    this.state = false
  }
}
