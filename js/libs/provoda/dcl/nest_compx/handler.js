define(function(require) {
'use strict'

var updateNesting = require('../../Model/updateNesting');
var multiPathAsString = require('../../utils/multiPath/asString')
var getDepValue = require('../../utils/multiPath/getDepValue')
var isMeaningfulValue = require('../../utils/isMeaningfulValue')

var isNestingChanged = require('../../utils/isNestingChanged')
var pvState = require('pv/state')

var prepareArgs = function(dcl, _runStates) {
  var result = new Array(dcl.deps.length);

  for (var i = 0; i < dcl.deps.length; i++) {
    result[i] = _runStates[dcl.deps[i]]
  }

  return result;
};

var createInitialStates = function(dcl, runner) {
  var _runStates = {}

  for (var i = 0; i < dcl.raw_deps.length; i++) {
    var cur = dcl.raw_deps[i]
    var val = getDepValue(runner.md, cur, null)
    _runStates[dcl.deps[i]] = val
  }

  if (runner.needs_self) {
    _runStates['<<<<'] = runner.md
  }

  return _runStates;
}

var recalc = function(dcl, runner, current_motivator) {
  if (!runner._runStates) {
    runner._runStates = createInitialStates(dcl, runner)
  }

  var args = prepareArgs(dcl, runner._runStates)
  var calcFn = dcl.calcFn
  var result = calcFn.apply(null, args)

  var dest_name = dcl.dest_name;
  if (!current_motivator) {
    throw new Error('should be current_motivator')
  }

  updateNesting(runner.md, dest_name, result)
}

var changeValue = function(current_motivator, runner, dep_full_name, value) {
  var dcl = runner.dcl


  if (!runner._runStates) {
    runner._runStates = createInitialStates(dcl, runner)
  }

  runner._runStates[dep_full_name] = value;

  recalc(dcl, runner, current_motivator)
}

var getOneValue = function(dep, item) {
  if (!item) {
    return item;
  }

  if (dep.result_type != 'state') {
    return item
  }

  return pvState(item, dep.state.base)
}

var mapList = function(dep, list) {
  var result = new Array(list.length)
  for (var i = 0; i < list.length; i++) {
    result[i] = getOneValue(dep, list[i])
  }
  return result
}

var zip_fns = {
  'one': function(list, dep) {
    return list && getOneValue(dep, list[0])
  },
  'every': function(list, dep) {
    return list && mapList(dep, list).every(isMeaningfulValue)
  },
  'some': function(list, dep) {
    return list && mapList(dep, list).some(isMeaningfulValue)
  },
  'find': function(list, dep) {
    return list && mapList(dep, list).find(isMeaningfulValue)
  },
  'all': function(list, dep) {
    return list && mapList(dep, list)
  }
}

var zipValue = function(runner, lwroot, list) {
  var dep = lwroot.data.dep
  var zip_name = dep.zip_name || 'all'
  var zipFn = zip_fns[zip_name]

  return zipFn(list, dep)
}

var getValue = function(runner, lwroot, list) {
  if (!lwroot.state_name && !lwroot.data.dep.zip_name) {
    // we can get same, but mutated `value`
    var to_pass = Array.isArray(list) ? list.slice(0) : list;
    return to_pass
  }

  return zipValue(runner, lwroot, list)
}


return {
  hnest_state: function(motivator, __, lwroot) {
    var data = lwroot.data
    var runner = data.runner

    changeValue(motivator, runner, multiPathAsString(data.dep), getValue(runner, lwroot, lwroot.ordered_items))
  },
  hnest: function nestCompxNestDepChangeHandler(current_motivator, _, lwroot) {
    var data = lwroot.data
    var runner = data.runner

    changeValue(current_motivator, runner, multiPathAsString(data.dep), getValue(runner, lwroot, lwroot.ordered_items))
  },
  hstate: function nestCompxStateDepChangeHandler(current_motivator, runner, dep_full_name, value) {
    changeValue(current_motivator, runner, dep_full_name, value)
  },
  recalc: recalc,
}

})
