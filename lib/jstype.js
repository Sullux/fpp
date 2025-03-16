/* eslint-disable valid-typeof */
const { Panic } = require('./panic')

const isUndefined = (v) => v === undefined
const Undefined = function Undefined () {
  if (new.target) {
    Panic.throw('Undefined cannot be instantiated')
  }
}
Object.defineProperty(Undefined, Symbol.hasInstance, {
  value: isUndefined,
})

const isNull = (v) => v === null
const Null = function Null () {
  if (new.target) {
    Panic.throw('Null cannot be instantiated')
  }
  return null
}
Object.defineProperty(Null, Symbol.hasInstance, {
  value: isNull,
})

const constructorOf = (value) =>
  (value === undefined)
    ? Undefined
    : (value === null)
        ? Null
        : value.constructor

const defaultConstructorName = '(unknown)'

const constructorName = (value) =>
  constructorOf(value)?.name || defaultConstructorName

const primitiveTypes = [
  'string',
  'number',
  'bigint',
  'boolean',
  'undefined',
  'symbol',
]
const hints = [
  'default',
  'number',
  'string',
]

const isPrimitive = (v) => (v === null) || primitiveTypes.includes(typeof v)
const Primitive = function Primitive (v, hint = 'default') {
  if (isPrimitive(v)) return v
  hint = hints.includes(hint) ? hint : 'default'
  const convert = v?.[Symbol.toPrimimitive]
  v = convert ? convert(hint) : v
  return isPrimitive(v) ? v : String(v)
}
Object.defineProperty(Primitive, Symbol.hasInstance, {
  value: isPrimitive,
})

const isBox = Symbol('isBox')

const referenceTypes = [
  'object',
  'symbol',
  'function',
]

const isReference = (v) => (v !== null) && referenceTypes.includes(typeof v)
const Reference = function Reference (v) {
  if (new.target) {
    Panic.throw('Reference cannot be instantiated')
  }
  return isReference(v)
    ? v
    : Object.freeze({
      constructor: Reference,
      value: v,
      [Symbol.toPrimitive]: () => v,
      [isBox]: true,
    })
}
Object.defineProperty(Reference, Symbol.hasInstance, {
  value: isReference,
})

module.exports = {
  Undefined,
  Null,
  constructorOf,
  defaultConstructorName,
  constructorName,
  primitiveTypes,
  isPrimitive,
  Primitive,
  referenceTypes,
  isReference,
  Reference,
}
