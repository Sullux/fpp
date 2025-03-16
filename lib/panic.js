class PanicError extends Error {}

const Panic = (description) => ({
  constructor: Panic,
  description,
  throw: () => { throw new PanicError(description) },
})
Object.defineProperty(Panic, Symbol.hasInstance, {
  value: (v) => v.constructor === Panic,
})
Panic.throw = (description) => Panic(description).throw()

module.exports = { Panic, PanicError }
