const {
  Reference,
  constructorName,
} = require('./jstypes')
const { Panic } = require('./panic')

const functions = new WeakMap()

const isPure = (v) => functions.has(v)

const Pure = (fn, ...deps) => {
  if (!(fn instanceof Function)) {
    Panic.throw(`expected Function; got ${constructorName(fn)}`)
  }
  fn = fn instanceof Function
    ? fn
    : Panic.throw(`expected Function; got ${constructorName(fn)}`)
  functions.set(fn, deps.map(Reference))
  return fn
}
Object.defineProperty(Pure, Symbol.hasInstance, {
  value: (v) => functions.has(v),
})

module.exports = { Pure, isPure }
