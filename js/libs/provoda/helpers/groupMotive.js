

export default function(fn) {
  return function() {
    const self = this
    if (!this._currentMotivator()) {
      throw new Error('should have motivator')
    }
    return fn.apply(self, arguments)
  }
};
