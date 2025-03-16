/* eslint-disable no-extend-native */

class Result {
  constructor (ok, error, value) {
    this.ok = ok
    this.error = error
    this.value = value
  }

  * [Symbol.iterator] () {
    yield this.ok
    yield this.error
    yield this.value
  }

  static ok (value) {
    return new Result(true, undefined, value)
  }

  static error (error) {
    return new Result(false, error, undefined)
  }
}

Function.prototype.try = function operatorTry (...args) {
  const fn = this
  try {
    const result = fn.apply(fn, args)
    return result instanceof Promise
      ? result.then(Result.ok, Result.error)
      : Result.ok(result)
  } catch (error) {
    return Result.error(error)
  }
}

Function.prototype.tryApply = function operatorTryApply (thisArg, args) {
  const fn = this
  try {
    const result = fn.apply(thisArg, args)
    return result instanceof Promise
      ? result.then(Result.ok, Result.error)
      : Result.ok(result)
  } catch (error) {
    return Result.error(error)
  }
}

Function.prototype.tryCall = function operatorTryCall (thisArg, ...args) {
  return this.tryApply(thisArg, args)
}

Function.prototype.tryBind = function operatorTryBind (thisArg, ...args) {
  const bound = this.bind(thisArg, ...args)
  const fn = bound.try.bind(bound)
  Object.defineProperty(fn, 'name', { value: `try ${bound.name}` })
  return fn
}

module.exports = { Result }
