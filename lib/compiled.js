const compiled = new WeakMap()

// input, function, returns, dependencies
const compilable = (i, fn, r, ...d) => {
  // todo: interface => function
  compiled.add(fn, { i, r })
  return {
    compile: (v) => {},
    call: (v) => {},
  }
}

module.eports = { compilable }
