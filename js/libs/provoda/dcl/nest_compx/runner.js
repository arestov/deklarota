import handler from './handler'
import subscribing from '../../utils/multiPath/subscribing'
var hstate = handler.hstate
var recalc = handler.recalc

var copyStates = function(md, target, state_name, full_name, runner) {
  md.lwch(target, state_name, function(value) {
    hstate(this.current_motivator, runner, full_name, value)
  })
}

var subscribe = subscribing(copyStates)

var runUsual = function(self, md, list) {
  if (!list || !list.length) {
    return
  }
  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    subscribe(md, cur, self)
  }
}

var NestCompxRunner = function(md, dcl) {
  this.dcl = dcl
  this.md = md
  this._runStates = null

  var parsed_deps = this.dcl.parsed_deps

  runUsual(this, md, parsed_deps.usual)
  this.needs_self = parsed_deps.self
  recalc(dcl, this, md.current_motivator || md._currentMotivator())
  Object.seal(this)
}

export default NestCompxRunner
