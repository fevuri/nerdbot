//TODO add express etc. to dependencies
import * as EvEmtr from 'events'
import * as bparser from 'body-parser'
import * as express from 'express'

export default class HkRcvr extends EvEmtr {
  constructor({
    bot
  }) {
    Object.assign(this, {
      app: express(),
      bot,
    })
  }

  start() {
    //TODO read express docu and maybe rewrite
    this.app.use(bparser.json({strict: true}))
    this.app.post(this.bot.getPathN(':id'), (req, res)=> {
      this.emit('msg')
      res.sendStatus(200)
    })

    this.runnin = true
  }

  stop() {
    this.runnin = false
  }
}
