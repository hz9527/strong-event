import Manager from './scheduler';

export * from './builtIn';

export default class StrongEvent {
  #manager;

  constructor(manager) {
    this.#manager = manager && manager.constructor === Manager ? manager : new Manager();
  }

  pipe(fn) {
    const event = new StrongEvent(this.#manager.pipe(fn));
    if (this.emit === StrongEvent.prototype.emit) {
      event.emit = this.emit.bind(this);
      event.complete = this.complete.bind(this);
      event.error = this.error.bind(this);
    } else {
      event.emit = this.emit;
      event.complete = this.complete;
      event.error = this.error;
    }
    return event;
  }

  on(fn, ind) {
    return this.#manager.add(fn, ind);
  }

  emit(data) {
    this.#manager.run(data);
  }

  complete(data) {
    this.#manager.finish(data);
  }

  error(data) {
    this.#manager.finish(data, false);
  }
}
