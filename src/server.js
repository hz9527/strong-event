// timer server 在一个微队列里接受所有传入timer，使得其共用同一个timer
// 同一次发布才会共用timeServer
// 1. 所有 Server 继承自 Server
// 2. ServerFactory 用于管理 event 实例使用的 servers，在实例化event时实例化出来
// 3. ServerFactory 可以继承servers
class ServerInstance {
  constructor(servers) {
    Object.keys(servers).forEach(key => {
      this[key] = (new servers[key]()).init()
    })
  }
}
export class Server {
  init() {
    return () => {}
  }
}
function getClassName(Class) {
  return Class.name.replace(/^\S/, sub => sub.toLowerCase())
}
class ServerFactory {
  constructor() {
    this.servers = ServerFactory.defaultServers
  }
  create() {
    return new ServerInstance(this.servers)
  }
  use(serverClass) {
    if (serverClass && serverClass.prototype instanceof Server) {
      this.servers[getClassName(serverClass)] = serverClass
    }
  }
  extendServers(serverFactory) {
    if (serverFactory && serverFactory.constructor === ServerFactory) {
      this.servers = Object.assign({}, serverFactory.servers, this.servers)
    }
  }
  static install(serverClass) {
    if (serverClass && serverClass instanceof Server) {
      this.defaultServers[getClassName(serverClass)] = serverClass
    }
  }
}
ServerFactory.defaultServers = {}

export class TimerServer extends Server {
  constructor() {
    super()
    this.data = {}
    this.id = 1
    this.isUpdate = false
  }
  add(cb, time) {
    if (this.isUpdate === false) {
      this.isUpdate = true
      Promise.resolve().then(() => {
        delete this.data[this.id]
        this.id++
      })
    }
    if (!this.data[this.id] || !this.data[this.id][time]) {
      if (!this.data[this.id]) this.data[this.id] = {}
      this.data[this.id][time] = [cb]
      const list = this.data[this.id][time]
      setTimeout(() => list.forEach(cb => cb()), time)
    } else {
      this.data[this.id][time].push(cb)
    }
    return this.data[this.id]
  }
  init() {
    return (cb, time) => this.add(cb, time)
  }
}

export default ServerFactory