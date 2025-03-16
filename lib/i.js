const {
  constructorOf,
  constructorName,
} = require('./jstypes')

const keyInterface = new Map()
const interfaceKey = new Map()

const I = function I (assertion) {
  return I.infer(assertion)
}
Object.defineProperty(I, Symbol.hasInstance, {
  value: (v) => interfaceKey.has(v),
})

I.test = (t) => {
  //
}

I.infer = (assertion) => {} // todo

I.as = (c) => (v) => {
  const cv = constructorOf(v)
  return (c === cv) || `expected constructor ${c.name}; got ${cv.name}`
}

I.of = (c) => (v) =>
  (v instanceof c) ||
    `expected instanceof ${c.name}; got ${constructorName(v)}`

I.type = (t) => (v) => {
  const tv = typeof v
  return (t === tv) || `expected typeof ${t}; got ${tv}`
}

const keyValue = ([k, v]) => I.prop(k, v)

I.prop = (n, i) => {
  if (Array.isArray(n) && (!i)) return I.prop(n[0], n[1])
  return (v) => {
    const result = i(v?.[n])
    return result === true ? true : `.${String(n)}: ${result}`
  }
}

const iteratorProps = (iterable) => (v) => {
  let i = 0
  const m = []
  for (const o of v) {
    // if
    i++
  }
}

I.every = (...o) => {
  if (o[Symbol.iterator]) {
    return iteratorProps(o)
  }
  const props = Object.entries(o).map((n, i) => I.prop(n, i))
  return (v) => {
    const problems = props.map(v).filter((m) => !!m)
    return problems.length ? problems : true
  }
}

module.exports = { I }
