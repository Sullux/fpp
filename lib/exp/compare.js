
const is = (value, compareValue) =>
  (value === compareValue) || (
    (typeof value === 'number') &&
    (typeof compareValue === 'number') &&
    Number.isNaN(value) &&
    Number.isNaN(compareValue)
  )
const strictEqual = is

const compareTypes = (value, compareValue) => {
  const valueName = typeName(value)
  const compareName = typeName(compareValue)
  if (compareName === valueName) {
    return 0
  }
  return valueName.localeCompare(compareName)
}
