function getError(msg) {
  return () => {
    throw new Error(msg)
  }
}
const timerError = getError('timerServer is needed')
function filter(fn) {
  return (data, next) => {
    fn(data) && next(data)
  }
}

function map(fn) {
  return (data, next) => {
    next(fn(data))
  }
}

function timer(time) {
  return (data, next, {timerServer = timerError}) => {
    timerServer(() => {
      next(data)
    }, time)
  }
}

function debounceTime(time) {
  let hasPlay = false
  return (data, next, {timerServer = timerError}) => {
    if (!hasPlay) {
      hasPlay = true
      timerServer(() => (hasPlay = false), time)
      next(data)
    }
  }
}

function async() {
  return (data, next) => {
    Promise.resolve(data).then(next)
  }
}

function scan(fn, preValue) {
  return (data, next) => {
    preValue = fn(preValue, data)
    next(preValue)
  }
}
export {filter, map, timer, debounceTime, async, scan}
