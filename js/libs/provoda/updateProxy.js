

import triggerLightAttrChange from './internal_events/light_attr_change/trigger'
import produceEffects from './AttrsOwner/produceEffects'
import _passHandleState from './dcl/passes/handleState/handle'
import attrToRel from './dcl/nests/attrToRel'
import deliverAttrQueryUpdates from './Model/mentions/deliverAttrQueryUpdates'
import sameName from './sameName'
import shallowEqual from './shallowEqual'
import legacySideEffects from './handleLegacySideEffects'
import { hasOwnProperty } from './hasOwnProperty'
import { updateModelAttrsInDktStorage } from './_internal/reinit/dkt_storage'

const CH_GR_LE = 2

let serv_counter = 1
const ServStates = function() {
  this.num = ++serv_counter
  this.collecting_states_changing = false

  this.states_changing_stack = []

  this.total_ch = []
  this.total_original_states = new Map()
  Object.seal(this)
}

const free_sets = [new Set()]
const getFreeSet = function() {
  return free_sets.length ? free_sets.pop() : new Set()
}

const releaseSet = function(set) {
  set.clear()
  free_sets.push(set)
}

const pool = {
  free: [],
  busy: {}
}

const getFree = function(pool) {
  if (pool.free.length) {
    return pool.free.pop()
  } else {
    const item = new ServStates()
    pool.busy[item.num] = true
    return item
  }
}

const release = function(pool, item) {
  pool.busy[item.num] = null
  pool.free.push(item)
}


function applyAllAttrComputations(etr, total_original_states, total_ch, states_changing_stack) {
  let currentChangesLength


  while (states_changing_stack.length) {

    //spv.cloneObj(original_states, etr.states);

    let cur_changes_list = states_changing_stack.shift()

    const lengthBeforeAnyChanges = total_ch.length

    currentChangesLength = lengthBeforeAnyChanges
    // remember current length before any changes in this iteration


    //получить изменения для состояний, которые изменил пользователь через публичный метод
    getChanges(etr, total_original_states, 0, cur_changes_list, total_ch)
    //var total_ch = ... ↑


    if (etr.full_comlxs_index != null) {
      //проверить комплексные состояния
      while (currentChangesLength != total_ch.length) {
        const lengthToHandle = total_ch.length
        applyComplexStates(etr, total_original_states, currentChangesLength, total_ch)
        currentChangesLength = lengthToHandle
      }
    }

    cur_changes_list = null


    //объекты используются повторно, ради выиграша в производительности
    //которые заключается в исчезновении пауз на сборку мусора
  }
}

const iterateSetUndetailed = createIterate0arg(_setUndetailedState)
const iterateStChanges = createIterate1arg(_triggerStChanges)
const reversedCompressChanges = createReverseIterate0arg(compressChangesList)


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

  if (etr._provoda_id != null) {
    updateModelAttrsInDktStorage(etr, total_ch)
  }

  legacySideEffects(etr, total_original_states, total_ch, 0, total_ch.length)


  produceEffects(total_ch, total_original_states, etr)
}


function processStackedAttrChanges(etr, serv_st) {
  serv_st.collecting_states_changing = true
  //etr.serv_st.collecting_states_changing - must be semi public;


  const states_changing_stack = serv_st.states_changing_stack
  const total_original_states = serv_st.total_original_states
  const total_ch = serv_st.total_ch

  while (states_changing_stack.length) {
    applyAllAttrComputations(etr, total_original_states, total_ch, states_changing_stack)

    //устраняем измененное дважды и более
    compressStatesChanges(total_ch)

    propagateAttrChanges(etr, total_original_states, total_ch)

    total_ch.length = 0

    total_original_states.clear()
  }

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

  const serv_st = etr.serv_st || getFree(pool)
  etr.serv_st = serv_st

  serv_st.states_changing_stack.push(changes_list)

  if (serv_st.collecting_states_changing) {
    return etr
  }

  processStackedAttrChanges(etr, serv_st)

  return etr
}

function localState(name) {
  if (!this.states.hasOwnProperty(name)) {
    return
  }
  return this.states[name]
}

function createFakeEtr(etr, first_changes_list) {
  return {
    etr: {
      states: {},
      _attrs_collector: etr._attrs_collector,
      full_comlxs_list: etr.full_comlxs_list,
      full_comlxs_index: etr.full_comlxs_index,
      __attrs_all_comp: etr.__attrs_all_comp,
      state: localState,
    },
    total_original_states: new Map(),
    total_ch: [],
    states_changing_stack: [first_changes_list],
  }
}

function freezeFakeEtr(fake) {
  Object.freeze(fake.etr.states)
  Object.freeze(fake.total_original_states)
  Object.freeze(fake.total_ch)
  Object.freeze(fake.states_changing_stack)
}

function toKey(entry) {
  return entry[0]
}

function computeInitialAttrs(etr, total_original_states, total_ch, states_changing_stack) {
  applyAllAttrComputations(etr, total_original_states, total_ch, states_changing_stack)
  compressStatesChanges(total_ch)

  etr.original_values = [...total_original_states.entries()].map(toKey)
}

function initAttrs(etr, prototype_changes, input_initial_changes) {
  const serv_st = etr.serv_st || getFree(pool)
  etr.serv_st = serv_st

  const total_original_states = serv_st.total_original_states

  const original_values = prototype_changes.original_values

  for (let i = 0; i < original_values.length; i++) {
    const name = original_values[i]
    total_original_states.set(name, undefined)
  }

  Array.prototype.push.apply(etr.serv_st.total_ch, prototype_changes.total_ch)

  // write precomputed changes
  getChanges(etr, total_original_states, 0, etr.serv_st.total_ch, null)

  // compute new changes
  serv_st.states_changing_stack.push(input_initial_changes)
  processStackedAttrChanges(etr, serv_st)
}


// mirco optimisations for monomorphism of args
function createIterate0arg(cb) {
  return function iterageChListWith0Args(changes_list, context) {
    for (let i = 0; i < changes_list.length; i += CH_GR_LE) {
      cb(context, i, changes_list[i], changes_list[i + 1])
    }
  }
}

function createIterate1arg(cb) {
  return function iterageChListWith1Args(changes_list, context, arg1) {
    for (let i = 0; i < changes_list.length; i += CH_GR_LE) {
      cb(context, i, changes_list[i], changes_list[i + 1], arg1)
    }
  }
}

function _setUndetailedState(etr, _i, state_name, value) {
  etr._lbr.undetailed_states[state_name] = value
}




function getChanges(etr, total_original_states, start_from, changes_list, result_arr) {
  const changed_states = result_arr
  let i

  // input array can be same as output array
  // we are going mutate output array
  // so we will mutate length of input during processing!
  // preventing infinit circle here
  const inputLength = changes_list.length
  for (i = start_from; i < inputLength; i += CH_GR_LE) {
    const state_name = changes_list[i]
    reportBadChange(etr, state_name)
    _replaceState(etr, total_original_states, sameName(state_name), changes_list[i + 1], changed_states)
  }


  // return changed_states;
}

function isSameValue(old_value, value) {
  if (old_value == null && value == null) {
    return true
  }

  if (old_value === value) {
    return true
  }

  if (shallowEqual(old_value, value)) {
    return true
  }

  return false
}

function getAttr(etr, attr_name) {
  return etr.states[attr_name]
}

function setAttr(etr, attr_name, value) {
  etr.states[attr_name] = value
}

function _replaceState(etr, total_original_states, state_name, value, stack) {
  const old_value = getAttr(etr, state_name)
  if (isSameValue(old_value, value)) {
    return
  }

  //value = value || false;
  //less calculations? (since false and "" and null and undefined now os equeal and do not triggering changes)
  if (!total_original_states.has(state_name)) {
    total_original_states.set(state_name, old_value)
  }

  etr._attrs_collector.ensureAttr(state_name)
  setAttr(etr, state_name, value)

  if (stack == null) {
    return
  }
  stack.push(state_name, value)
}

function getComplexInitList(etr) {
  if (etr.full_comlxs_list == null) {return}
  const result_array = []

  for (let i = 0; i < etr.full_comlxs_list.length; i++) {
    const cur = etr.full_comlxs_list[i]
    const cur_val = etr.state(cur.name)
    const new_val = compoundComplexState(etr, cur)
    if (isSameValue(cur_val, new_val)) {
      continue
    }
    result_array.push(cur.name, new_val)
  }

  return result_array
}

function applyOneComplexAttr(etr, total_original_states, input_and_output, subj, uniq) {
  const name = subj.name
  if (uniq.has(name)) {
    return
  }

  uniq.add(name)

  const value = compoundComplexState(etr, subj)
  _replaceState(
    etr, total_original_states,
    sameName(subj.name), value, input_and_output
  )
}

function applyComplexStates(etr, total_original_states, start_from, input_and_output) {
  // reuse set
  const uniq = getFreeSet()

  let i
  let cur

  const originalLength = input_and_output.length

  for (i = start_from; i < originalLength; i += CH_GR_LE) {
    cur = etr.full_comlxs_index[input_and_output[i]]
    if (cur == null) {
      continue
    }

    if (!Array.isArray(cur)) {
      applyOneComplexAttr(etr, total_original_states, input_and_output, cur, uniq)
      continue
    }

    for (let jj = 0; jj < cur.length; jj++) {
      const subj = cur[jj]
      applyOneComplexAttr(etr, total_original_states, input_and_output, subj, uniq)
    }
  }

  // release reused set
  releaseSet(uniq)

}

export const calcProvidedCompList = function(model, provided_comp_list, input_and_output) {
  const fake = createFakeEtr(model, [])

  for (let i = 0; i < model._attrs_collector.all.length; i++) {
    const attr = model._attrs_collector.all[i]
    fake.etr.states[attr] = model.getAttr(attr)
  }

  // reuse set
  const uniq = getFreeSet()

  for (let i = 0; i < provided_comp_list.length; i++) {
    const attr_name = provided_comp_list[i]
    const cur = fake.etr.__attrs_all_comp[attr_name]
    applyOneComplexAttr(fake.etr, fake.total_original_states, input_and_output, cur, uniq)
  }

  // release reused set
  releaseSet(uniq)
}

function depValue(etr, dcl, num) {
  return etr.state(dcl.depends_on[num])
}

function callCompFn(etr, dcl) {
  // avoid creating array (avoid GC work)
  const fn = dcl.fn
  switch (dcl.depends_on.length) {
    case 1:
      return fn(depValue(etr, dcl, 0))
    case 2:
      return fn(depValue(etr, dcl, 0), depValue(etr, dcl, 1))
    case 3:
      return fn(depValue(etr, dcl, 0), depValue(etr, dcl, 1), depValue(etr, dcl, 2))
    case 4:
      return fn(depValue(etr, dcl, 0), depValue(etr, dcl, 1), depValue(etr, dcl, 2), depValue(etr, dcl, 3))
    default: {
      const values = new Array(dcl.depends_on.length)
      for (let i = 0; i < dcl.depends_on.length; i++) {
        values[i] = depValue(etr, dcl, i)
      }
      return fn.apply(null, values)
    }
  }
}

export function compoundComplexState(etr, temp_comx) {
  for (let i = 0; i < temp_comx.require_marks.length; i++) {
    const cur = temp_comx.require_marks[i]
    const state_name = temp_comx.depends_on[cur]
    if (etr.state(state_name) == null) {
      return null
    }
  }

  return callCompFn(etr, temp_comx)
}

function compressChangesList(result_changes, changes_list, _i, prop_name, value, counter) {
  if (result_changes.has(prop_name)) {
    return
  }

  result_changes.add(prop_name)

  const num = (changes_list.length - 1) - counter * CH_GR_LE
  changes_list[ num - 1 ] = prop_name
  changes_list[ num ] = value

  return true
}

function createReverseIterate0arg(cb) {
  return function reverseIterateChListWith0Args(changes_list, context) {
    let counter = 0
    for (let i = changes_list.length - 1; i >= 0; i -= CH_GR_LE) {
      if (cb(context, changes_list, i, changes_list[i - 1], changes_list[i], counter)) {
        counter++
      }
    }
    return counter
  }
}


function compressStatesChanges(changes_list) {
  const result_changes = getFreeSet()
  let counter = reversedCompressChanges(changes_list, result_changes)
  counter = counter * CH_GR_LE
  while (changes_list.length != counter) {
    changes_list.shift()
  }
  releaseSet(result_changes)
  return changes_list
}



function _triggerStChanges(etr, _i, state_name, value, total_original_states) {

  _passHandleState(etr, total_original_states, state_name, value)

  attrToRel(etr, state_name, value)
  deliverAttrQueryUpdates(etr, state_name)

  triggerLightAttrChange(etr, state_name, value)
}

function reportBadChange(etr, state_name) {
  if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
    return
  }

  if (!etr.getInstanceKey) {return}

  if (etr._highway.warn_unexpected_attrs === false) {return}

  // only for models
  if (!etr._provoda_id) {return}

  if (hasOwnProperty(etr.compx_check, state_name)) {
    return
  }
  //
  if (etr.__bad_attrs_reported && etr.__bad_attrs_reported.hasOwnProperty(state_name)) {
    return
  }
  //
  if (!etr.constructor.prototype.hasOwnProperty('__bad_attrs_reported')) {
    // __bad_attss_reported should be shared for all model instances
    etr.constructor.prototype.__bad_attrs_reported = {}
  }

  etr.__bad_attrs_reported[state_name] = true

  if (state_name == '_provoda_id') {
    return
  }

  if (etr.__default_attrs && etr.__default_attrs.hasOwnProperty(state_name)) {
    return
  }

  const err = new Error('unexpected-attr-change')
  console.log({state_name}, err, '\n', etr.__code_path)
  throw err
}

const update = function updateWithValidation(md, state_name, state_value, opts) {
  /*if (state_name.indexOf('-') != -1 && console.warn){
    console.warn('fix prop state_name: ' + state_name);
  }*/
  if (md.hasComplexStateFn(state_name)) {
    throw new Error('you can\'t change complex state ' + state_name)
  }
  return updateProxy(md, [state_name, state_value], opts)


  // md.updateState(state_name, state_value, opts);
}

updateProxy.update = update
updateProxy.getComplexInitList = getComplexInitList

export { createFakeEtr, freezeFakeEtr, computeInitialAttrs, getComplexInitList, initAttrs, update }

export default updateProxy
