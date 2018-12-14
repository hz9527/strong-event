import Event, {filter, map, timer, debounceTime, async} from '../index.js'

const event = new Event()
console.log(event.pipe(filter(() => {})))
console.log(event.pipe(filter(() => {})).on(() => {}))
event.on(data => {
  console.log('test')
})

event.pipe(timer(10))
  .pipe(filter(d => d > 1))
  .pipe(map(v => ({value: v})))
  .on(data => {
    Promise.resolve('timer is same time')
      .then(console.log)
    console.log('timer1', data)
  })
event.pipe(timer(5))
  .pipe(timer(5))
  .pipe(filter(d => d > 1))
  .on(data => {
    Promise.resolve('timer3 is same time').then(console.log)
    console.log('timer3')
  })
setTimeout(() => {
  console.log('test 5ms')
}, 5)
event.pipe(timer(5)).on(v => console.log('timer 5ms'))
event.pipe(timer(10))
  .pipe(filter(d => d > 1))
  .on(data => {
    console.log('timer2')
  })
event.pipe(timer(5))
  .pipe(timer(5))
  .pipe(filter(d => d > 1))
  .on(data => {
    console.log('timer4')
  })
event.pipe(debounceTime(3))
  .on(data => {
    console.log('debounceTime')
  })
event.pipe(async())
  .on(data => {
    console.log('async')
  })

const ev = event.on(data => {
  console.log('test index')
  ev.off()
}, -1)

event.emit(1)
event.emit(2)
setTimeout(() => {
  event.emit(3)
}, 5)
