const noop = () => {};

class RemoveEvent {
  #data = null

  constructor(data, index, fn) {
    this.#data = data;
    this.index = index;
    this.fn = fn;
  }

  off() {
    const i = this.index;
    const data = this.#data;
    if (!data.content[i]) return;
    data.content[i] = data.content[i].filter(({ handler }) => handler !== this.fn);
    if (data.content[i].length === 0) {
      delete data.content[i];
      data.index.splice(data.index.indexOf(i), 1);
    }
  }
}

function schedulerExector(schedulers, data, fn, server, i = 0) {
  const scheduler = schedulers[i];
  if (!scheduler) {
    fn(data);
  } else {
    scheduler(data, (newData = data) => {
      schedulerExector(schedulers, newData, fn, server, i + 1);
    }, server);
  }
}

const opts = { next: 'handler', error: 'error', complete: 'complete' };
function resolveSubscribe(data, schedulers) {
  if (!data) return false;
  const result = { schedulers };
  if (typeof data === 'function') {
    result.handler = data;
  } else {
    Object.keys(opts).forEach((key) => {
      typeof data[key] && (result[opts[key]] = data[key]);
    });
  }
  return result;
}

export {
  noop,
  RemoveEvent,
  schedulerExector,
  resolveSubscribe,
};
