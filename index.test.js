require('./globals')

describe('index', () => {
  it('should set up globals', () => {
    expect(fpp_version).toBe(require('./package.json').version)
  })
})
