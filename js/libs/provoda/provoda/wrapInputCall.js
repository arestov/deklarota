

export default function wrapInputCall(fn) {
  return function() {
    var flow = this._getCallsFlow()
    var args = Array.prototype.slice.call(arguments)
    flow.pushToFlow(fn, this, args)
  }
};
