const { Result } = require('./try')

const err = new Error('everything')
const succeeding = (v) => v
const failing = () => { throw err }

describe('try', () => {
  describe('Result', () => {
    it('should be a tuple with a value', () => {
      const [ok, error, value] = Result.ok(42)
      expect(ok).toBe(true)
      expect(value).toBe(42)
      expect(error).toBe(undefined)
    })

    it('should be a tuple with a value', () => {
      const [ok, error, value] = Result.error(err)
      expect(ok).toBe(false)
      expect(value).toBe(undefined)
      expect(error).toBe(err)
    })
  })

  describe('try()', () => {
    it('should return result', () => {
      const result = succeeding.try(42)
      expect(result.ok).toBe(true)
      expect(result.value).toBe(42)
      expect(result.error).toBe(undefined)
    })

    it('should return error', () => {
      const result = failing.try(42)
      expect(result.ok).toBe(false)
      expect(result.value).toBe(undefined)
      expect(result.error).toBe(err)
    })
  })

  describe('tryApply()', () => {
    const data = {
      x: 40,
    }
    const succeeding = function (y) { return this.x + y }
    const failing = function () { throw err }

    it('should return result', () => {
      const result = succeeding.tryApply(data, [2])
      expect(result.ok).toBe(true)
      expect(result.value).toBe(42)
      expect(result.error).toBe(undefined)
    })

    it('should return error', () => {
      const result = failing.tryApply(data, [2])
      expect(result.ok).toBe(false)
      expect(result.value).toBe(undefined)
      expect(result.error).toBe(err)
    })
  })

  describe('tryCall()', () => {
    const data = {
      x: 40,
    }
    const succeeding = function (y) { return this.x + y }
    const failing = function () { throw err }

    it('should return result', () => {
      const result = succeeding.tryCall(data, 2)
      expect(result.ok).toBe(true)
      expect(result.value).toBe(42)
      expect(result.error).toBe(undefined)
    })

    it('should return error', () => {
      const result = failing.tryCall(data, 2)
      expect(result.ok).toBe(false)
      expect(result.value).toBe(undefined)
      expect(result.error).toBe(err)
    })
  })

  describe('tryBind()', () => {
    const data = {
      x: 40,
    }
    const succeeding = function succeeding (y, z) { return this.x + y + z }
      .tryBind(data, 1)
    const failing = function failing () { throw err }.tryBind(data, 40)

    it('should return result', () => {
      const result = succeeding(1)
      expect(result.ok).toBe(true)
      expect(result.value).toBe(42)
      expect(result.error).toBe(undefined)
    })

    it('should return error', () => {
      const result = failing(1)
      expect(result.ok).toBe(false)
      expect(result.value).toBe(undefined)
      expect(result.error).toBe(err)
    })
  })
})
