const net = require('net')
const Connection = require('./Connection.js')
const shortid = require('shortid')

/**
 * example usage
 * const smtpServer = new SMTPServer (options)
 * const smtpServer = createSMTPServer({
 *  onError: (error) => {
 *    this.logger.error(error)
 *  },
 *  getConnectionCount: () => {
 *    return new Promise
 *  }
 *
 *
 *
 *
 *
 * })
 */

function createSMTPServer (schema = {}) {
  return new SMTPServer(schema)
}

class SMTPServer {
  constructor (schema = {}) {
    this._schema = schema
    this._connections = {}
    this._server = net.createServer(this.createServer.bind(this))
    this._server.on('close', () => {
      console.log('connection closed')
    })

    this._server.listen(1337, '127.0.0.1')
  }

  createServer (socket) {
    const parse = SMTPServer.parse
    const state = SMTPServer.state
    const id = shortid.generate()
    socket.id = id
    const connection = new Connection(socket, { parse, state, schema: this._schema })
    this._connections[id] = connection

    socket.on('error', (e) => {
      console.log('error', e)
    })

    socket.on('close', (args) => {
      const id = socket.id || ''
      this.removeId(id)
      console.log('closed connection', socket.id)
    })
  }

  getServer () {
    return this._server
  }

  getConnectionCount () {
    return new Promise((resolve, reject) => {
      this._server.getConnections((error, count) => {
        if (error) {
          console.log(error)
          return reject(error)
        }

        return resolve(count)
      })
    })
  }

  removeId (id) {
    delete this._connections[id]
  }

  static state () {
    return Object.create(null)
  }

  /* debugging methods below */
  send (id, line) {
    this._connections[id].parse(line)
  }

  list () {
    return Object.keys(this._connections)
  }

  getMail (id) {
    return this._connections[id] && this._connections[id].getMail()
  }

  /* end debugging code */
}

module.exports = SMTPServer