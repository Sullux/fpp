const { isValueAsync, Sync } = require('./async')

const callStack = () =>
  (new Error('TRACE')).stack.split('\n').slice(2).map((line) => line.trim())

const maxStackSize = 1000
const stack = new Array(maxStackSize).fill()
stack[0] = globalThis
let stackSync
let sp = 0

const stackOverflow = () => {
  const message = 'call stack size exceeded'
  const e = new Error(message)
  const tail = stack.slice(-10).map(({ debug }) => debug).join('\n    ')
  e.stack = `${message}\n    ${tail}...`
  throw e
}

const pushSync = () => {
  // todo
  sp += 1
}

const push = (value, debug) => {
  if (sp >= maxStackSize) return stackOverflow()
  if (stackSync) {
    return (stackSync = stackSync.then(() => pushSync(value, debug)))
  }
  const asyncValue = Sync(value)
  if (isValueAsync(asyncValue)) {
    // todo
  }
  debug = debug || callStack()[1]
  //
}

const Context_OLD = () => {
  let stack = {
    values: [],
    debug: [],
  }

  const defaultStackTraceLimit = 10

  const trace = () => {
    const limit = Error.stackTraceLimit || defaultStackTraceLimit
    return [...stack.debug].reverse().slice(0, limit).join('\n')
  }

  const push = (value, debug) => (stack = {
    values: [...stack.values, value],
    debug: [...stack.debug, debug],
  }) || undefined

  const pop = () => (stack = {
    values: stack.values.slice(0, -1),
    debug: stack.debug.slice(0, -1),
  }) || undefined

  const awaitContext = (value, resolve, reject) => {
    const asyncValue = Sync(value)
    if (isValueAsync(asyncValue)) { return resolve ? resolve(value) : value }
    const stackRef = stack
    return asyncValue.then(
      resolve && ((syncValue) => {
        const savedStack = stack
        stack = stackRef
        try {
          const result = resolve(syncValue)
          stack = savedStack
          return result
        } catch (error) {
          stack = savedStack
          throw error
        }
      }),
      reject && ((error) => {
        const savedStack = stack
        stack = stackRef
        try {
          const result = reject(error)
          stack = savedStack
          return result
        } catch (error) {
          stack = savedStack
          throw error
        }
      }))
  }

  // todo: find a better way to get the correct line
  const currentCall = () => (new Error('DEBUG')).stack
    .split('\n')[3]

  const enterContext = (value, continuation) => {
    const syncValue = Sync(value)
    if (isValueAsync(syncValue)) {
      return context.await(
        syncValue,
        (value) => enterContext(value, continuation),
      )
    }
    push(value, currentCall())
    try {
      const result = continuation()
      pop()
      return result
    } catch (error) {
      pop()
      if (error && ((typeof error) === 'object')) {
        try {
          error.fpStack = trace()
        } catch (e) {}
      }
      throw error
    }
  }

  const value = (index = 0) => stack.values[(stack.values.length - index) - 1]

  const get = (name, startIndex = 0) => {
    const { values } = stack
    for (let i = (values.length - 1) - startIndex; i > -1; i--) {
      const value = values[i]
      if (value && ((typeof value) === 'object')) {
        if (name in value) { return value[name] }
      }
    }
  }

  return Object.freeze({
    await: awaitContext,
    enter: enterContext,
    trace,
    defaultStackTraceLimit,
    value,
    get,
  })
}

const context = Context()

module.exports = {
  Context,
  context,
  callStack,
  maxStackSize,
}
