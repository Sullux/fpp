
const compileError = (message) => {
  throw new Error(`compile error: ${message}`)
}

const typeName = (value) =>
  value === undefined
    ? 'Undefined'
    : value === null
      ? 'Null'
      : value.constructor?.name || 'Any'

const records = new WeakSet()

const isRecord = (obj) =>
  ((typeof obj) === 'object') && records.includes(obj)

const validateRecord = () => {} // todo

const recordSchema = (record) => {
  record = Record(record)
}

const Record = (obj) => isRecord(obj)
  ? obj
  : obj?.constructor === globalThis.Object
    ? recordFromObject(obj)
    : Array.isArray(obj)
      ? recordFromObject(Object.fromEntries(obj))
      : compileError(`expected Object or Array; got ${typeName(obj)}`)

Record.isRecord = isRecord

module.exports = { Record }
