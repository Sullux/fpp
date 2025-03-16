/* eslint-disable valid-typeof */

const Undefined = function Undefined () {
  if (new.target) {
    throw new Error('Undefined cannot be instantiated with new.')
  }
}
Object.defineProperty(Undefined, Symbol.hasInstance, {
  value: (v) => v === undefined,
})

const Null = function Null () {
  if (new.target) {
    throw new Error('Null cannot be instantiated with new.')
  }
  return null
}
Object.defineProperty(Null, Symbol.hasInstance, {
  value: (v) => v === null,
})

const constructor = (value) =>
  (value === undefined)
    ? Undefined
    : (value === null)
        ? Null
        : value.constructor || Any

const types = new Map()

const primitiveTypes = [
  'string',
  'number',
  'bigint',
  'boolean',
  'undefined',
  'symbol',
]

primitiveTypes.forEach((name) => Type.def(name, (v) => (typeof v) === name))

const Type = {
  def: function defType (name, test) {
    types.set(name, test)
  },
}

module.exports = { Type }
