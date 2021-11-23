

export default function wrapInputCall(fn) {
  return function() {
    const flow = this._getCallsFlow()
    const args = Array.prototype.slice.call(arguments)
    flow.pushToFlow(fn, this, args)
  }
};
