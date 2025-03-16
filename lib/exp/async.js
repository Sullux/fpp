
const isThennable = (v) => {
  const then = v?.then
  if (!then) return false
  return ((typeof then) === 'function') && then.length === 2
}

const isValueAsync = (v) => (v instanceof Promise) ||
isThennable(v) ||
(!!v?.[Symbol.asyncIterator])

const hasAsync = (v) => {
  if (isValueAsync(v)) return true
  if (constructor(v) === Object) return Object.entries(v).some(hasAsync)
  if (v[Symbol.iterator]) {
    for (const element of v) {
      if (hasAsync(element)) return true
    }
  }
  return false
}

const Async = function Async (v) {
  if (new.target) {
    throw new Error('Async cannot be instantiated with new.')
  }
  return (v instanceof Promise)
    ? v
    : isThennable(v)
      ? new Promise((resolve, reject) => v.then(resolve, reject))
      : (v instanceof Error)
          ? Promise.reject(v)
          : Promise.resolve(v)
}
Object.defineProperty(Async, Symbol.hasInstance, {
  value: hasAsync,
})

const knownSyncValues = new WeakSet()
const knownSync = (value) => {
  knownSyncValues.add(value)
  return value
}

const deepAwait = (v) => {
  if (v instanceof Async) return v
  if (knownSyncValues.has(v)) return v
  const type = constructor(v)
  if (type === Object) {
    const result = deepAwait(Object.entries(v))
    return (result instanceof Async)
      ? result.then(Object.fromEntries).then(knownSync)
      : v
  }
  if (v?.[Symbol.asyncIterator]) {
    return (async () => {
      const result = []
      for await (const sync of v) result.push(sync)
      return result
    })().then(knownSync)
  }
  if (v?.[Symbol.iterator]) {
    const array = ((type === Array) ? v : [...v]).map(deepAwait)
    return array.some((v) => v instanceof Async)
      // eslint-disable-next-line new-cap
      ? Promise.all(array).then((a) => new type(a)).then(knownSync)
      : v
  }
  return v
}

const Sync = function Sync (v) {
  if (new.target) {
    throw new Error('Sync cannot be instantiated with new.')
  }
  return deepAwait(v)
}
Object.defineProperty(Sync, Symbol.hasInstance, {
  value: (v) => !((v instanceof Promise) || isThennable(v)),
})

module.exports = {
  isThennable,
  isValueAsync,
  hasAsync,
  Async,
  Sync,
}
