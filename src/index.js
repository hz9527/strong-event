import {
  noop, RemoveEvent, resolveSubscribe, schedulerExector,
} from './helper';
import ServerFactory, { TimerServer } from './server';

export * from './builtIn';
export * from './server';
class Data {
  constructor() {
    this.index = [];
    this.content = {};
    this.serverFactory = new ServerFactory();
  }
}
class SchedulerList extends Array {}
const defaultServers = [TimerServer];

function complete(data, method, value, cb = noop) {
  const { list, content } = data;
  data.index = [];
  data.content = {};
  const server = data.serverFactory.create();
  list.forEach((key) => {
    content[key].forEach((item) => {
      item[method] ? schedulerExector(item.schedulers, value, item[method]) : cb(value);
    }, server);
  });
}

class BaseEvent {
  #schedulers;

  #data;

  constructor(data, schedulers) {
    this.#data = data && data.constructor === Data ? data : new Data();
    this.#schedulers = schedulers && schedulers.constructor === SchedulerList
      ? schedulers : new SchedulerList();
  }

  pipe(fn) {
    if (typeof fn !== 'function') throw new Error(`${fn} must be a sc;heduler`);
    // eslint-disable-next-line no-use-before-define
    return new BaseEvent(this.#data, this.#schedulers.concat(fn));
  }

  on(fn, ind = 0) {
    const opts = resolveSubscribe(fn, this.#schedulers);
    if (!opts) throw new Error(`${fn} is invaild`);
    const index = typeof ind === 'number' ? ind : 0;
    let i = 0;
    const len = this.#data.index.length;
    while (index > this.#data.index[i] && len > i) {
      i++;
    }
    if (this.#data.index[i] !== index) {
      this.#data.index[i] > index ? this.#data.index.splice(i, 0, index) : this.#data.index.unshift(index);
    }
    this.#data.content[index] = this.#data.content[index] || [];
    this.#data.content[index].push(opts);
    return new RemoveEvent(this.#data, index, fn);
  }

  emit(data) {
    // 需要 for循环
    const list = this.#data.index.slice();
    const server = this.#data.serverFactory.create();
    for (let i = 0; i < list.length; i++) {
      this.#data.content[list[i]].forEach((item) => {
        schedulerExector(item.schedulers, data, item.handler, server);
      });
    }
  }

  complete(data) {
    complete.call(this, this.#data, 'complete', data);
  }

  error(err) {
    complete.call(this, this.#data, 'error', err, (data) => {
      if (data && data.constructor !== Error) throw new Error('uncatch err');
    });
  }
}

export default class StrongEvent extends BaseEvent {
  #serverFactory;

  constructor(serverOpt = true) {
    const data = new Data();
    super(data);
    this.#serverFactory = data.serverFactory;
    if (serverOpt === true) { // use default server
      defaultServers.forEach((server) => {
        this.#serverFactory.use(server);
      });
    }
  }

  useServer(server) {
    this.#serverFactory.use(server);
  }

  extendEventServer(event) {
    if (event && (event instanceof BaseEvent)) {
      this.#serverFactory.extendServers(event.#serverFactory);
    }
  }
}
