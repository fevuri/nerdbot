//TODO add express etc. to dependencies
import * as bparser from 'body-parser'
import * as express from 'express'

export default class TgHk {
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
    this.app.use(bparser.json())
    this.app.post(this.bot.getPathN(':id'), (req, res)=> {
      //TODO emit new message
      res.sendStatus(200)
    })
  }
}
