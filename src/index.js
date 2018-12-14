import {noop, RemoveEvent, resolveSubscribe, schedulerExector} from './helper.js'
import ServerFactory, {TimerServer} from './server'
export * from './builtIn'
export TimerServer
class Data {
  constructor() {
    this.index = []
    this.content = {}
    this.serverFactory = new ServerFactory()
  }
}
const defaultData = new Data()
const defaultServers = [TimerServer]

class SuperEvent {
  #data = defaultData
  #schedulers = []
  constructor() {
    if (this.constructor === SuperEvent) throw new Error("can't instantition SuperEvent")
  }
  pipe(fn) {
    return new ShareDataEvent(this.#data, this.#schedulers.concat(fn))
  }
  on(fn, index = 0) {
    const opts = resolveSubscribe(fn, this.#schedulers)
    if (!opts) throw new Error(`${fn} is invaild`)
    typeof index !== 'number' && (index = 0)
    let i = 0
    while(index > this.#data.index[i]) {
      i++
    }
    this.#data.index[i] !== index && this.#data.index.splice(i, 0, index)
    this.#data.content[index] = this.#data.content[index] || []
    this.#data.content[index].push(opts)
    return new RemoveEvent(this.#data, index, fn)
  }
  emit(data) {
    // 需要 for循环
    const list = this.#data.index.slice()
    const server = this.#data.serverFactory.create()
    for (let i = 0; i < list.length; i++) {
      this.#data.content[list[i]].forEach(item => {
        schedulerExector(item.schedulers, data, item.handler, server)
      })
    }
  }
  complete(data) {
    _complete.call(this, this.#data, 'complete', data)
  }
  error(err) {
    _complete.call(this, this.#data, 'error', data, data => {
      if (data && data.constructor !== Error) throw new Error('uncatch err')
    })
  }
}

function _complete(data, method, value, cb = noop) {
  const list = data.index
  const content = data.content
  data.index = []
  data.content = {}
  const server = data.serverFactory.create()
  list.forEach(key => {
    content[key].forEach(item => {
      item[method] ? schedulerExector(item.schedulers, value, item[method]) : cb(value)
    }, server)
  })
}

export default class Event extends SuperEvent {
  #data = new Data()
  #schedulers = []
  constructor(serverOpt = true) {
    super()
    if (serverOpt === true) { // use default server
      defaultServers.forEach(server => {
        this.#data.serverFactory.use(server)
      })
    }
  }
  useServer(server) {
    this.#data.serverFactory.use(server)
  }
  extendEventServer(event) {
    if (event && (event.constructor === Event || event.constructor === ShareDataEvent)) {
      this.#data.serverFactory.extendServers(event.#data.serverFactory)
    }
  }
}
class ShareDataEvent extends SuperEvent {
  #schedulers = null
  #data = null
  constructor(data, schedulers) {
    super()
    this.#schedulers = schedulers
    this.#data = data
  }
}
