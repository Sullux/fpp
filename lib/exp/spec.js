/* eslint-disable valid-typeof */
const fpp = Symbol.fpp || (Symbol.fpp = {})
const fppSpec = fpp.spec || (fpp.spec = Symbol('fpp.spec'))
const fppAsserted = fpp.asserted || (fpp.asserted = Symbol('fpp.asserted'))

const compileError = (message) => {
  throw new Error(`compile error: ${message}`)
}

const typeName = (value) =>
  value === undefined
    ? 'Undefined'
    : value === null
      ? 'Null'
      : value.constructor?.name || 'Any'

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

const createSpec = (test, assert, report, name) => ({
  test,
  assert,
  report,
  name,
})

const assertionError = (message) => {
  throw new Error(`assertion error: ${message}`)
}

const typeDescription = (value) => {
  // todo
}

const typeSpec = (name) => {
  const lowerName = name.toLowerCase()
  const test = (v) => typeName(v).toLowerCase() === lowerName
  const assert = (v) => {
    const actual = typeName(v)
    return actual.toLowerCase() === lowerName
      ? v
      : assertionError(`expected type ${name}; got ${actual}`)
  }
  const report = (v) => {
    const actual = typeName(v)
    return actual.toLowerCase() === lowerName
      ? []
      : [`expected type ${name}; got ${actual}`]
  }
  return createSpec(
    test,
    assert,
    report,
    `[typeof]:${name}`,
  )
}

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
      Spec(
        (v) => value[fppSpec](v?.[name]),
        `${String(name)}:(${String(value)})`,
      ),
  },
  test: {
    value: (test) =>
      Spec(test, `[test]:${test.toString()}`),
  },
  instanceof: {
    value: (c) =>
      Spec((v) => v instanceof c, `[instanceof]:${c.name || '(anonymous)'}`),
  },
  [Symbol.hasInstance]: { value: (v) => !!v?.[fppSpec] },
})
