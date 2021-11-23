module.exports = function makeFake() {
  return {
    source_name: 'fake',
    errors_fields: [],
    get() {
      const p = Promise.resolve({ bio: 'was born' })
      // eslint-disable-next-line fp/no-mutation
      p.abort = function noop() {}

      return p
    },
  }
}
