

import triggerLightAttrChange from './internal_events/light_attr_change/trigger'
import produceEffects from './StatesEmitter/produceEffects'
import checkStates from './nest-watch/checkStates'
import _passHandleState from './dcl/passes/handleState/handle'
import deliverAttrQueryUpdates from './Model/mentions/deliverAttrQueryUpdates'
import sameName from './sameName'

var CH_GR_LE = 2

var serv_counter = 1
var ServStates = function() {
  this.num = ++serv_counter
  this.collecting_states_changing = false

  this.states_changing_stack = []

  this.total_ch = []
  this.total_original_states = new Map()
  Object.seal(this)
}

var free_sets = [new Set()]
var getFreeSet = function() {
  return free_sets.length ? free_sets.pop() : new Set()
}

var releaseSet = function(set) {
  set.clear()
  free_sets.push(set)
}

var pool = {
  free: [],
  busy: {}
}

var getFree = function(pool) {
  if (pool.free.length) {
    return pool.free.pop()
  } else {
    var item = new ServStates()
    pool.busy[item.num] = true
    return item
  }
}

var release = function(pool, item) {
  pool.busy[item.num] = null
  pool.free.push(item)
}


function applyAllAttrComputations(etr, total_original_states, total_ch, states_changing_stack) {
  var currentChangesLength


  while (states_changing_stack.length) {

    //spv.cloneObj(original_states, etr.states);

    var cur_changes_list = states_changing_stack.shift()

    var lengthBeforeAnyChanges = total_ch.length

    currentChangesLength = lengthBeforeAnyChanges
    // remember current length before any changes in this iteration


    //получить изменения для состояний, которые изменил пользователь через публичный метод
    getChanges(etr, total_original_states, 0, cur_changes_list, total_ch)
    //var total_ch = ... ↑


    if (etr.full_comlxs_index != null) {
      //проверить комплексные состояния
      while (currentChangesLength != total_ch.length) {
        var lengthToHandle = total_ch.length
        applyComplexStates(etr, total_original_states, currentChangesLength, total_ch)
        currentChangesLength = lengthToHandle
      }
    }

    cur_changes_list = null


    //объекты используются повторно, ради выиграша в производительности
    //которые заключается в исчезновении пауз на сборку мусора
  }
}

var iterateSetUndetailed = createIterate0arg(_setUndetailedState)
var iterateStChanges = createIterate1arg(_triggerStChanges)
var reversedCompressChanges = createReverseIterate0arg(compressChangesList)


function propagateAttrChanges(etr, total_original_states, total_ch) {
  iterateStChanges(total_ch, etr, total_original_states)

  if (etr.updateTemplatesStates != null) {
    etr.keepTotalChangesUpdates(etr.states)
    etr.updateTemplatesStates(total_ch)
  }
  //utils_simple.wipeObj(original_states);
  //all_i_cg.length = all_ch_compxs.length = changed_states.length = 0;

  if (etr.sendStatesToMPX != null && total_ch.length) {
    etr.sendStatesToMPX(total_ch)
  }
  legacySideEffects(etr, total_original_states, total_ch, 0, total_ch.length)


  produceEffects(total_ch, total_original_states, etr)
}


function processStackedAttrChanges(etr, serv_st) {
  serv_st.collecting_states_changing = true
  //etr.serv_st.collecting_states_changing - must be semi public;


  var states_changing_stack = serv_st.states_changing_stack
  var total_original_states = serv_st.total_original_states
  var total_ch = serv_st.total_ch

  applyAllAttrComputations(etr, total_original_states, total_ch, states_changing_stack)

  //устраняем измененное дважды и более
  compressStatesChanges(total_ch)

  propagateAttrChanges(etr, total_original_states, total_ch)


  total_ch.length = 0

  total_original_states.clear()


  serv_st.collecting_states_changing = false
  etr.serv_st = null

  release(pool, serv_st)
}

function updateProxy(etr, changes_list, opts) {

  if (etr._currentMotivator() == null) {
    throw new Error('wrap pvUpdate call in `.input()`')
  }

  if (opts != null) {
    throw new Error('options are depricated')
  }

  if (etr._lbr != null && etr._lbr.undetailed_states != null) {
    iterateSetUndetailed(changes_list, etr)
    return etr
  }

  //порождать события изменившихся состояний (в передлах одного стэка/вызова)
  //для пользователя пока пользователь не перестанет изменять новые состояния

  var serv_st = etr.serv_st || getFree(pool)
  etr.serv_st = serv_st

  serv_st.states_changing_stack.push(changes_list)

  if (serv_st.collecting_states_changing) {
    return etr
  }

  processStackedAttrChanges(etr, serv_st)

  return etr
}

function createFakeEtr(etr, first_changes_list) {
  var state = {}

  return {
    etr: {
      states: state,
      _attrs_collector: etr._attrs_collector,
      full_comlxs_list: etr.full_comlxs_list,
      full_comlxs_index: etr.full_comlxs_index,
      state: function(name) {
        if (!state.hasOwnProperty(name)) {
          return
        }
        return state[name]
      }
    },
    total_original_states: new Map(),
    total_ch: [],
    states_changing_stack: [first_changes_list],
  }
}

function toKey(entry) {
  return entry[0]
}

function computeInitialAttrs(etr, total_original_states, total_ch, states_changing_stack) {
  applyAllAttrComputations(etr, total_original_states, total_ch, states_changing_stack)
  compressStatesChanges(total_ch)

  etr.original_values = [...total_original_states.entries()].map(toKey)
}

function initAttrs(etr, fake, input_initial_changes) {
  var serv_st = etr.serv_st || getFree(pool)
  etr.serv_st = serv_st

  var total_original_states = serv_st.total_original_states

  var original_values = fake.etr.original_values

  for (var i = 0; i < original_values.length; i++) {
    var name = original_values[i]
    total_original_states.set(name, undefined)
  }

  Array.prototype.push.apply(etr.serv_st.total_ch, fake.total_ch)

  // write precomputed changes
  getChanges(etr, total_original_states, 0, etr.serv_st.total_ch, null)

  // compute new changes
  serv_st.states_changing_stack.push(input_initial_changes)
  processStackedAttrChanges(etr, serv_st)
}


// mirco optimisations for monomorphism of args
function createIterate0arg(cb) {
  return function iterageChListWith0Args(changes_list, context) {
    for (var i = 0; i < changes_list.length; i += CH_GR_LE) {
      cb(context, i, changes_list[i], changes_list[i + 1])
    }
  }
}

function createIterate1arg(cb) {
  return function iterageChListWith1Args(changes_list, context, arg1) {
    for (var i = 0; i < changes_list.length; i += CH_GR_LE) {
      cb(context, i, changes_list[i], changes_list[i + 1], arg1)
    }
  }
}

function _setUndetailedState(etr, i, state_name, value) {
  etr._lbr.undetailed_states[state_name] = value
}

function getStateChangeEffect(target, state_name) {
  if (target.__state_change_index == null) {
    return null
  }

  if (!target.__state_change_index.hasOwnProperty(state_name)) {
    return null
  }
  return target.__state_change_index[state_name]
}

function proxyStch(target, state_name, value, old_value) {

  var method = getStateChangeEffect(target, state_name)

  method(target, value, old_value)
}

function _handleStch(etr, state_name, value, old_value) {
  var method = getStateChangeEffect(etr, state_name)
  if (method == null) {
    return
  }

  etr.nextLocalTick(proxyStch, [etr, state_name, value, old_value], true, method.finup)
}

function getChanges(etr, total_original_states, start_from, changes_list, result_arr) {
  var changed_states = result_arr
  var i

  // input array can be same as output array
  // we are going mutate output array
  // so we will mutate length of input during processing!
  // preventing infinit circle here
  var inputLength = changes_list.length
  for (i = start_from; i < inputLength; i += CH_GR_LE) {
    var state_name = changes_list[i]
    reportBadChange(etr, state_name)
    _replaceState(etr, total_original_states, sameName(state_name), changes_list[i + 1], changed_states)
  }


  // return changed_states;
}

function isSimpleObject(obj) {
  if (obj == null) {
    return false
  }

  if (Array.isArray(obj)) {
    return true
  }

  if (typeof obj != 'object') {
    return false
  }

  if (obj.constructor != Object) {
    // Don't allow custom instances like Date, URL, etc...
    return false
  }

  return true
}

function shallowEqual(objA, objB) {
  if (!isSimpleObject(objA) || !isSimpleObject(objB)) {
    return false
  }

  /*
    fast check. just 1st level of props
  */

  for (var name in objA) {
    if (objA.hasOwnProperty(name)) {
      if (objA[name] !== objB[name]) {
        return false
      }
    }
  }

  // objA and objB can have dirrenent keys number. so check both

  for (var name in objB) {
    if (objB.hasOwnProperty(name)) {
      if (objB[name] !== objA[name]) {
        return false
      }
    }
  }

  return true
}

function _replaceState(etr, total_original_states, state_name, value, stack) {
  var old_value = etr.states[state_name]
  if (old_value == null && value == null) {
    return
  }

  if (old_value === value) {
    return
  }

  if (shallowEqual(old_value, value)) {
    return
  }

  //value = value || false;
  //less calculations? (since false and "" and null and undefined now os equeal and do not triggering changes)
  if (!total_original_states.has(state_name)) {
    total_original_states.set(state_name, old_value)
  }

  etr._attrs_collector.ensureAttr(state_name)
  etr.states[state_name] = value

  if (stack == null) {
    return
  }
  stack.push(state_name, value)
}

function getComplexInitList(etr) {
  if (etr.full_comlxs_list == null) {return}
  var result_array = []

  for (var i = 0; i < etr.full_comlxs_list.length; i++) {
    var cur = etr.full_comlxs_list[i]
    result_array.push(cur.name, compoundComplexState(etr, cur))
  }

  return result_array
}

function applyComplexStates(etr, total_original_states, start_from, input_and_output) {
  // reuse set
  var uniq = getFreeSet()

  var i, cur

  var originalLength = input_and_output.length

  for (i = start_from; i < originalLength; i += CH_GR_LE) {
    cur = etr.full_comlxs_index[input_and_output[i]]
    if (cur == null) {
      continue
    }
    for (var jj = 0; jj < cur.length; jj++) {
      var subj = cur[jj]
      var name = subj.name
      if (uniq.has(name)) {
        continue
      }

      uniq.add(name)

      var value = compoundComplexState(etr, subj)
      _replaceState(
        etr, total_original_states,
        sameName(subj.name), value, input_and_output
      )
    }
  }

  // release reused set
  releaseSet(uniq)

}

function compoundComplexState(etr, temp_comx) {
  for (var i = 0; i < temp_comx.require_marks.length; i++) {
    var cur = temp_comx.require_marks[i]
    var state_name = temp_comx.depends_on[cur]
    if (etr.state(state_name) == null) {
      return null
    }
  }
  var values = new Array(temp_comx.depends_on.length)
  for (var i = 0; i < temp_comx.depends_on.length; i++) {
    values[i] = etr.state(temp_comx.depends_on[i])
  }
  return temp_comx.fn.apply(etr, values)
}

function compressChangesList(result_changes, changes_list, i, prop_name, value, counter) {
  if (result_changes.has(prop_name)) {
    return
  }

  result_changes.add(prop_name)

  var num = (changes_list.length - 1) - counter * CH_GR_LE
  changes_list[ num - 1 ] = prop_name
  changes_list[ num ] = value

  return true
}

function createReverseIterate0arg(cb) {
  return function reverseIterateChListWith0Args(changes_list, context) {
    var counter = 0
    for (var i = changes_list.length - 1; i >= 0; i -= CH_GR_LE) {
      if (cb(context, changes_list, i, changes_list[i - 1], changes_list[i], counter)) {
        counter++
      }
    }
    return counter
  }
}


function compressStatesChanges(changes_list) {
  var result_changes = getFreeSet()
  var counter = reversedCompressChanges(changes_list, result_changes)
  counter = counter * CH_GR_LE
  while (changes_list.length != counter) {
    changes_list.shift()
  }
  releaseSet(result_changes)
  return changes_list
}

function legacySideEffects(etr, total_original_states, changes_list, start_from, inputLength) {
  if (etr.__syncStatesChanges != null || etr.__handleHookedSync != null) {
    var to_send = changes_list.slice(start_from, inputLength)
    if (etr.__syncStatesChanges != null) {
      etr.__syncStatesChanges.call(null, etr, to_send, etr.states)
    }

    if (etr.__handleHookedSync != null) {
      etr.__handleHookedSync.call(null, etr, to_send, etr.states)
    }
  }

  for (var i = start_from; i < inputLength; i += CH_GR_LE) {
    _handleStch(etr, changes_list[i], changes_list[i + 1], total_original_states.get(changes_list[i]))
  }
}


function _triggerStChanges(etr, i, state_name, value, total_original_states) {

  _passHandleState(etr, total_original_states, state_name, value)

  checkStates(etr, state_name, value, total_original_states.get(state_name))
  deliverAttrQueryUpdates(etr, state_name)
  // states_links

  triggerLightAttrChange(etr, state_name, value)
}

function reportBadChange() {
  // if (etr.__default_attrs && etr.__default_attrs.hasOwnProperty(state_name)) {
  //   return
  // }
  //
  // if (etr.__bad_attrs_reported && etr.__bad_attrs_reported.hasOwnProperty(state_name)) {
  //   return
  // }
  //
  // if (!etr.__bad_attrs_reported) {
  //   // __bad_attss_reported should be shared for all model instances
  //   etr.constructor.prototype.__bad_attrs_reported = {}
  // }
  //
  // etr.__bad_attrs_reported[state_name] = true
  // console.warn('unexpectd change of attr: ', state_name, etr.model_name || 'Noname', etr.__code_path)
}

updateProxy.update = function(md, state_name, state_value, opts) {
  /*if (state_name.indexOf('-') != -1 && console.warn){
    console.warn('fix prop state_name: ' + state_name);
  }*/
  if (md.hasComplexStateFn(state_name)) {
    throw new Error('you can\'t change complex state ' + state_name)
  }
  return updateProxy(md, [state_name, state_value], opts)


  // md.updateState(state_name, state_value, opts);
}
updateProxy.getComplexInitList = getComplexInitList

export { createFakeEtr, computeInitialAttrs, getComplexInitList, initAttrs }

export default updateProxy
