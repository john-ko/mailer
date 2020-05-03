const Server = require('./src/smtp/server/Server.js')
const repl = require('./src/smtp/repl/repl')

const schema = {
  logger: {
    level: 'all',
  },
  config: {
    ip: '127.0.0.1',
    port: 1337,
    key: '',
    cert: '',
  },
  data () {
    return {
      accept: true
    }
  },
  events: {
    HELO (ctx) {
      console.log('HELO called')
      this.EHLO()
    },
    EHLO (ctx) {
      console.log('EHLO called')
    },
    AUTH (ctx) {
      console.log(ctx)
    }
  }
}

const server = Server.factory(schema)

const replOptions = {
  getConnectionCount: () => server.getConnectionCount(),
  list: () => server.list(),
  send: (id, line) => server.send(id, line),
  getMail: (id) => server.getMail(id)
}

repl(replOptions)