const fpp = require('./lib')

const globals = {
  ...fpp,
  // add your own globals here
}
Object.assign(globalThis, globals)
module.exports = globals
