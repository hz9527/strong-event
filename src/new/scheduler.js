import { defaultScheduler, noop, resolveSubscribe } from './helper';

export default class SchedulerManager {
  constructor(scheduler = defaultScheduler) {
    this.scheduler = scheduler;
    this.listeners = {
      index: [],
      content: {},
    };
    this.nexts = [];
    this.runIndex = null; // number
    this.cache = [];
    this.isFinish = false;
  }

  pipe(scheduler) {
    const manager = new SchedulerManager(scheduler);
    this.nexts.push(manager);
    return manager;
  }

  run(data) {
    const { scheduler, nexts } = this;
    scheduler(data, (nextData) => {
      this.emit(nextData);
      for (let i = 0, l = nexts.length; i < l; i++) {
        nexts[i].run(nextData);
      }
    });
  }

  emit(data, key = 'handler') {
    const { listeners: { index, content } } = this;
    const inds = index.slice();
    for (let i = 0, l = inds.length; i < l; i++) {
      this.runIndex = inds[i];
      const opts = content[inds[i]];
      let j = opts.length;
      while (j--) {
        opts[j] && opts[j][key](data);
      }
      if (this.cache.length) {
        key === 'handler' && opts.unshift(...this.cache);
        this.cache.length = 0;
      }
    }
    this.runIndex = null;
  }

  finish(data, isComplete = true) {
    const { scheduler, nexts } = this;
    const key = isComplete ? 'complete' : 'error';
    this.isFinish = true;
    scheduler(data, (nextData) => {
      this.emit(nextData, key);
      for (let i = 0, l = nexts.length; i < l; i++) {
        nexts[i].run(nextData);
      }
      nexts.length = 0;
      this.listeners = {
        index: [],
        content: {},
      };
    });
  }

  add(fn, ind = 0) {
    if (this.isFinish) {
      return noop;
    }
    const opt = resolveSubscribe(fn);
    const index = typeof ind === 'number' ? ind : 0;
    if (typeof this.runIndex === 'number' && index === this.runIndex) {
      this.cache.unshift(opt);
    } else {
      let i = 0;
      const { listeners: { index: inds, content } } = this;
      const len = inds.length;
      while (index > inds[i] && len > i) {
        i++;
      }
      if (inds[i] !== index) {
        inds[i] > index ? inds.splice(i, 0, index) : inds.unshift(index);
      }
      content[index] = content[index] || [];
      content[index].unshift(opt);
    }
    return this.off.bind(this, opt, index);
  }

  off(opt, ind) {
    const { listeners: { index, content } } = this;
    const list = content[ind];
    if (!list) {
      const i = this.cache.indexOf(opt);
      i > -1 && this.cache.splice(i, 1);
      return;
    }
    const i = list.indexOf(opt);
    if (i > -1) {
      list.splice(i, 1);
      list.length === 0 && index.splice(index.indexOf(i), 1);
    }
  }
}
