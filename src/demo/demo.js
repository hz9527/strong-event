import Event, {
  filter, map, timer, debounceTime, async, takelatest,
} from '../index';
/* eslint-disable no-console */
const event = new Event();
console.log(event.pipe(filter(() => {})));
console.log(event.pipe(filter(() => {})).on(() => {}));
event.on(() => {
  console.log('test');
});

event.pipe(timer(10))
  .pipe(filter(d => d > 1))
  .pipe(map(v => ({ value: v })))
  .on((data) => {
    Promise.resolve('timer is same time')
      .then(console.log);
    console.log('timer1', data);
  });
event.pipe(timer(5))
  .pipe(timer(5))
  .pipe(filter(d => d > 1))
  .on(() => {
    Promise.resolve('timer3 is same time').then(console.log);
    console.log('timer3');
  });
setTimeout(() => {
  console.log('test 5ms');
}, 5);
event.pipe(timer(5)).on(() => console.log('timer 5ms'));
event.pipe(timer(10))
  .pipe(filter(d => d > 1))
  .on(() => {
    console.log('timer2');
  });
event.pipe(timer(5))
  .pipe(timer(5))
  .pipe(filter(d => d > 1))
  .on(() => {
    console.log('timer4');
  });
event.pipe(debounceTime(3))
  .on(() => {
    console.log('debounceTime');
  });
event.pipe(async())
  .on(() => {
    console.log('async');
  });

const ev = event.on(() => {
  console.log('test index');
  ev.off();
}, -1);

event.emit(1);
event.emit(2);
setTimeout(() => {
  event.emit(3);
}, 5);

// takelatest
const thenable = data => new Promise((resolve, reject) => {
  setTimeout(() => {
    data > 3 ? reject(data) : resolve(data);
  }, 500);
});

const event2 = new Event();
event2.pipe(takelatest(thenable)).on(console.log);
event2.emit(1);
event2.emit(1.5);
setTimeout(() => {
  event2.emit(2);
}, 100);

setTimeout(() => {
  console.log(2333);
  event2.emit(3);
}, 700);
