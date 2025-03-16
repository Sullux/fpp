const { Panic, PanicError } = require('./panic')

describe('panic', () => {
  describe('Panic', () => {
    it('should create a panic object', () => {
      const p = Panic('reasons')
      expect(p.description).toBe('reasons')
      expect(p.constructor).toBe(Panic)
      expect(p instanceof Panic).toBe(true)
    })
    it('should throw', () => {
      const p = Panic('reasons')
      let err
      try { p.throw() } catch (e) { err = e }
      expect(err.message).toBe('reasons')
      expect(err instanceof PanicError).toBe(true)
    })
  })
  describe('PanicError', () => {
    it('should be a PanicError', () => {
      const err = new PanicError('reasons')
      expect(err.message).toBe('reasons')
      expect(err instanceof PanicError).toBe(true)
    })
  })
})
