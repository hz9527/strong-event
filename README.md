# strong-event

> a powerful event

## quick start

```js
const event = new Event()

event.on(data => console.log(data, 'index'), 1)

const subscriber = event.on(data => {
  console.log(data)
  subscriber.off()
})

event.pipe(filter(data => data > 1))
  .on(data => console.log(data, 'filter'))

event.pipe(timer(10))
  .on(data => {
    Promise.resolve('same timer is sync').then(console.log)
    console.log(data, 'timer1')
  })

event.pipe(timer(10))
  .on(data => {
    console.log(data, 'timer2')
  })

event.emit(1)
event.emit(2)

// 1
// 1 index
// 2 filter
// 2 index

/* delay 10 ms */
// 1 timer1
// 2 timer2
// same timer is sync

/* delay 20 ms */
// 1 timer1
// 2 timer2
// same timer is sync
```

## api

### Event instance

> can add subscribers for a event & dispatch data by event

Event & ShareDataEvent extends SuperEvent.
when you call pipe will return a ShareDataEvent instance.
SuperEvent's prototype has `pipe` `on` `emit` `error` & `complete` methods.

### `SuperEvent.prototype.on`

> return a subscriber instance & you can call off to unsubscribe this event

first argument is callback or option, second argument is index of this callback
(sort for subscriber's callbacks, every index saved in a array)

### `SuperEvent.prototype.emit`

> dispatch event for subscribers, you can emit a value

### `SuperEvent.prototype.error & complete`

> call it & all subscribers will not accept new event

### `SuperEvent.prototype.pipe`

> return a ShareDataEvent instance, & share subscribers info with event instance

argument is scheduler. like timer, filter, scan and so on.
it can control subscribe(callback) how to work

you can call event or shareDataEvent emit &
all of event's subscribers and all of shareDataEvent's subscribers will accept

### Event

| methods             | arguments        | description               | other                       |
| ------------------- | ---------------- | ------------------------- | --------------------------- |
| `useServer`         | `Server`         | Server for scheduler      | [see scheduler](#scheduler) |
| `extendEventServer` | `Event instance` | assign Servers from event | [see scheduler](#scheduler) |

### scheduler

> builtIn schedulers

- `map`
- `filter`
- `debounceTime`
- `timer`
- `async`
- `scan`

you can write a scheduler, it is a simple higher-order function.
but some time scheduler need a control too

```js
// filter
function filter(fn) {
  return (data, next) => {
    fn(data) && next(data)
  }
}

// timer
function timer(time) {
  return (data, next, {timerServer}) {
    timerServer(() => next(data), time)
  }
}
```

> so you can see same timer subscriber can call sync, becaseof Server

**how to write a Server**  

> you need use Server ?

how it work?

```js
class SuperEvent {
  emit(data) {
    const servers = serverFactory.create() // return all Servers of event & new them
    subscribers.forEach(subscriber => exector(data, servers))
  }
}
// ServerFactory
class ServerFactory {
  create() {
    return new ServerInstance(this.servers);
  }
}
class ServerInstance {
  constructor(servers) {
    Object.keys(servers).forEach((key) => {
      this[key] = (new servers[key]()).init();
    });
  }
}
```

so every time you emit, will provid servers instance.

ServerClass must extends Server, if not useServer will not work.

```js
export class TimerServer extends Server {
  constructor() {
    super();
    this.data = {};
    this.id = 1;
    this.isUpdate = false;
  }

  add(cb, time) {
    if (this.isUpdate === false) {
      this.isUpdate = true;
      Promise.resolve().then(() => {
        this.isUpdate = false;
        delete this.data[this.id];
        this.id++;
      });
    }
    if (!this.data[this.id] || !this.data[this.id][time]) {
      if (!this.data[this.id]) this.data[this.id] = {};
      this.data[this.id][time] = [cb];
      const list = this.data[this.id][time];
      setTimeout(() => list.forEach(fn => fn()), time);
    } else {
      this.data[this.id][time].push(cb);
    }
    return this.data[this.id];
  }

  init() {
    return (cb, time) => this.add(cb, time);
  }
}
```

> name is class name but initial replaceto lowercase

**about global Server**

> some time most of event instances need same Servers

```js
ServerFactory.install(Server)
```

**about defaultServers**

> builtIn TimerServer

```js
new Event(false) // will not support defaultServers(TimerServer)
```
