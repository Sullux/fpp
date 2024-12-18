/* eslint-disable valid-typeof */
const fpp = Symbol.fpp || (Symbol.fpp = {})
const fppType = fpp.type || (fpp.type = Symbol('fpp.type'))
const fppSpec = fpp.spec || (fpp.spec = Symbol('fpp.spec'))

const compileError = (message) => {
  throw new Error(`compile error: ${message}`)
}

const assertInstance = (c) =>
  (v) => v instanceof c
    ? v
    : compileError(`expected ${c.name}; got ${typeName(v)}`)

const Spec = (test, meta) => (typeof test) === 'function'
  ? Object.freeze({
      [fppSpec]: test,
      toString: () => meta,
    })
  : compileError(`expected Function; got ${constructor(test)}`)

const assertSpec = assertInstance(Spec)

Object.defineProperties(Spec, {
  type: {
    value: (name) =>
      Spec((v) => (typeof v) === name, `[typeof]:${name}`),
  },
  constructor: {
    value: (c) =>
      Spec(
        (v) => constructor(v) === c,
        `constructor:${c.name || '(anonymous)'}`,
      ),
  },
  value: {
    value: (expected) =>
      Spec((v) => v === expected, `[value]:${String(expected)}`),
  },
  property: {
    value: (name, value) => assertSpec(value) &&
      Spec((v) => v?.[name] === value, `${String(name)}:(${String(value)})`),
  },
  test: {
    value: (test) =>
      Spec(test, `[test]:${test.toString()}`),
  },
  [Symbol.hasInstance]: { value: (v) => !!v?.[fppSpec] },
})

const isCapitalized = ([c]) => c >= 'A' && c <= 'Z'

const isConstructor = (c) =>
  ((typeof c) === 'function') && isCapitalized(c)

const Type = (...specs) => {
  if (!specs.length) {
    const t = { [fppType]: specs }
    t[Symbol.hasInstance] = (v) => v === t
    return Object.freeze(t)
  }
  specs = specs.map(assertSpec)
    .sort((s1, s2) => String(s1).localeCompare(String(s2)))
  const meta = specs.map(String).join('|')
  if (existing) return existing
  if (specs.length === 1) {
    const spec = specs[0]
    return Object.freeze({
      [fppType]: assertInstance(Spec)(spec),
    })
  }
  return Object.freeze({
    [fppType]: specs.map(assertInstance(Spec)),
    [Symbol.hasInstance]: (v) => specs.every((spec) => spec(v)),
  })
}
Object.defineProperties(Type, {
  [Symbol.hasInstance]: {
    value: (v) => !!v?.[fppType],
  },
  of: { value: (c) => Type((v) => v instanceof c) },
  is: { value: (c) => Type((v) => constructor(v) === c) },
  some: {
    value: (...types) => Type((v) => types.some((type) => v instanceof type)),
  },
  every: {
    value: (...types) => Type((v) => types.every((type) => v instanceof type)),
  },
  from: {
    value: (spec) =>
      spec instanceof Type
        ? spec
        : spec instanceof Spec
          ? Type(spec)
          : (typeof spec) === 'string'
              ? Type.native[spec] ||
                compileError(`expected ${nativeTypes.join('|')}; got '${spec}'`)
              : isConstructor(spec)
                ? Type.is(spec)
                : (typeof spec) === 'function'
                    ? Type(Spec(spec))
                    : compileError(`expected Type|Spec|String|Function; got ${typeName(spec)}`),
  },
})

const primitiveTypes = [
  'string',
  'number',
  'bigint',
  'boolean',
  'undefined',
  'symbol',
]

const nativeTypes = [
  ...primitiveTypes,
  'object',
]

const Primitive = () =>
  Type((v) => (v === null) || primitiveTypes.includes(typeof v))

const Function = () => {}

const constructor = (value) =>
  (value === undefined)
    ? Undefined
    : (value === null)
        ? Null
        : value.constructor || Any

const typeName = (value) =>
  value === undefined
    ? 'Undefined'
    : value === null
      ? 'Null'
      : value.constructor?.name || 'Any'

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

// const Primitive = function Primitive () {
//   if (new.target) {
//     throw new Error('Primitive cannot be instantiated with new.')
//   }
//   return Primitive
// }
// Object.defineProperty(Primitive, Symbol.hasInstance, {
//   value: (v) => (constructor(v) === String) ||
//     (v === null) ||
//     primitiveTypes.includes(typeof v),
// })

const Any = function Any () {
  if (new.target) {
    throw new Error('Any cannot be instantiated with new.')
  }
  return Any
}
Object.defineProperty(Any, Symbol.hasInstance, {
  value: () => true,
})

const Truthy = function Truthy () {
  if (new.target) {
    throw new Error('Truthy cannot be instantiated with new.')
  }
  return Truthy
}
Object.defineProperty(Truthy, Symbol.hasInstance, {
  value: (v) => !!v,
})

const Falsy = function Falsy () {
  if (new.target) {
    throw new Error('Falsy cannot be instantiated with new.')
  }
  return Falsy
}
Object.defineProperty(Falsy, Symbol.hasInstance, {
  value: (v) => !v,
})

const Missing = function Missing (v) {
  if (new.target) {
    throw new Error('Missing cannot be instantiated with new.')
  }
  return (v === undefined) || (v === null) || Number.isNaN(v)
    ? v
    : false
}
Object.defineProperty(Missing, Symbol.hasInstance, {
  value: (v) => (v === undefined) || (v === null) || Number.isNaN(v),
})

const Value = function Value (v) {
  if (new.target) {
    throw new Error('Value cannot be instantiated with new.')
  }
  return (v !== undefined) && (v !== null) && (!Number.isNaN(v))
    ? v
    : false
}
Object.defineProperty(Value, Symbol.hasInstance, {
  value: (v) => (v !== undefined) && (v !== null) && (!Number.isNaN(v)),
})

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

const isExtendedFromPrimitive = (Type) =>
  isExtendedFrom(Type, String) ||
  isExtendedFrom(Type, Number) ||
  isExtendedFrom(Type, BigInt) ||
  isExtendedFrom(Type, Boolean) ||
  isExtendedFrom(Type, Undefined) ||
  isExtendedFrom(Type, Symbol) ||
  isExtendedFrom(Type, Null)

const isExtendedFrom =
  function isExtendedFrom (Type, ParentType) {
    return (Type === ParentType) ||
      (ParentType === Any) ||
      ((ParentType === Primitive) && isExtendedFromPrimitive(Type)) ||
      (Type?.prototype instanceof ParentType)
  }

const isExactType = (type, value) =>
  constructor(value) === type
const strictEqualType = isExactType

const isType = (type, value) =>
  value instanceof type

const isIterable =
  Symbol.asyncIterator
    ? function isIterable (value) {
        return !!(value && (value[Symbol.iterator] || value[Symbol.asyncIterator]))
      }
    : function isIterable (value) {
      return !!(value && value[Symbol.iterator])
    }

const typeCheckFunctions = (obj) =>
  Object.fromEntries(Object.entries(obj)
    .filter(([k, v]) => (typeof v) === 'function' && k[0] >= 'A')
    .map(([k, t]) => ([`is${k}`, (v) => v instanceof t])))

const types = {
  Undefined,
  Null,
  Primitive,
  Any,
  Truthy,
  Falsy,
  Missing,
  Value,
  Async,
  Sync,
}

module.exports = {
  constructor,
  typeName,
  isExtendedFrom,
  isExactType,
  strictEqualType,
  isType,
  isIterable,
  ...types,
  ...typeCheckFunctions(globalThis),
  ...typeCheckFunctions(types),
}
