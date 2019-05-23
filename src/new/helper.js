export const noop = () => {};

const Keys = ['error', 'complete', 'handler'];
export function resolveSubscribe(fn) {
  if (!fn) return false;
  const opt = typeof fn === 'function' ? { handler: fn } : fn;
  return Keys.reduce((res, key) => {
    res[key] = typeof opt[key] === 'function' ? opt[key] : noop;
    return res;
  }, {});
}

export function defaultScheduler(data, next) {
  next(data);
}
