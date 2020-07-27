define(function(require) {
'use strict';

var StatesLabour = require('./StatesLabour');
var utils_simple = require('./utils/simple');
var triggerLightAttrChange = require('./internal_events/light_attr_change/trigger')
var produceEffects = require('./StatesEmitter/produceEffects');
var checkStates = require('./nest-watch/checkStates');
var _passHandleState = require('./dcl/passes/handleState/handle')
var deliverAttrQueryUpdates = require('./Model/mentions/deliverAttrQueryUpdates')
var sameName = require('./sameName')

var CH_GR_LE = 2

var serv_counter = 1;
var ServStates = function() {
  this.num = ++serv_counter;
  this.collecting_states_changing = false;
  // this.original_states = {};

  this.states_changing_stack = [];

  this.total_ch = [];
  Object.seal(this)

  // this.stch_states = {};
};

var free_sets = [new Set()]
var getFreeSet = function() {
  return free_sets.length ? free_sets.pop() : new Set();
}

var releaseSet = function(set) {
  set.clear()
  free_sets.push(set)
}

var pool = {
  free: [],
  busy: {}
};

var getFree = function(pool) {
  if (pool.free.length) {
    return pool.free.pop();
  } else {
    var item = new ServStates();
    pool.busy[item.num] = true;
    return item;
  }
};

var release = function(pool, item) {
  pool.busy[item.num] = null;
  pool.free.push(item);
};

var iterateSetUndetailed = createIterate0arg(_setUndetailedState)
var iterateStChanges = createIterate1arg(_triggerStChanges)
var reversedCompressChanges = createReverseIterate0arg(compressChangesList)

function updateProxy(etr, changes_list, opts) {

  if (etr._currentMotivator() == null) {
    throw new Error('wrap pvUpdate call in `.input()`')
  }

  if (opts != null) {
    throw new Error('options are depricated')
  }

  if (etr._lbr != null && etr._lbr.undetailed_states != null){
    iterateSetUndetailed(changes_list, etr)
    return etr;
  }

  //порождать события изменившихся состояний (в передлах одного стэка/вызова)
  //для пользователя пока пользователь не перестанет изменять новые состояния
  if (etr.zdsv == null){
    etr.zdsv = new StatesLabour(etr.full_comlxs_index != null, etr._has_stchs);
  }


  var zdsv = etr.zdsv;
  var serv_st = etr.serv_st || getFree(pool);
  etr.serv_st = serv_st

  serv_st.states_changing_stack.push(changes_list);

  if (serv_st.collecting_states_changing){
    return etr;
  }

  serv_st.collecting_states_changing = true;
  //etr.zdsv is important for etr!!!
  //etr.serv_st.collecting_states_changing - must be semi public;


  var original_states = zdsv.original_states;

  var total_ch = serv_st.total_ch;
  var currentChangesLength

  while (serv_st.states_changing_stack.length){

    //spv.cloneObj(original_states, etr.states);

    var cur_changes_list = serv_st.states_changing_stack.shift();

    var lengthBeforeAnyChanges = total_ch.length

    currentChangesLength = lengthBeforeAnyChanges
    // remember current length before any changes in this iteration


    //получить изменения для состояний, которые изменил пользователь через публичный метод
    getChanges(etr, zdsv.total_original_states, original_states, 0, cur_changes_list, total_ch);
    //var total_ch = ... ↑


    if (etr.full_comlxs_index != null) {
      //проверить комплексные состояния
      while (currentChangesLength != total_ch.length) {
        var lengthToHandle = total_ch.length
        applyComplexStates(etr, zdsv.total_original_states, original_states, currentChangesLength, total_ch);
        currentChangesLength = lengthToHandle
      }
    }

    legacySideEffects(etr, total_ch, lengthBeforeAnyChanges, total_ch.length)

    cur_changes_list = null;


    utils_simple.wipeObj(original_states);
    //объекты используются повторно, ради выиграша в производительности
    //которые заключается в исчезновении пауз на сборку мусора
  }

  //устраняем измененное дважды и более
  compressStatesChanges(total_ch);

  if (etr.updateTemplatesStates != null) {
    etr.keepTotalChangesUpdates(etr.states)
    etr.updateTemplatesStates(total_ch);
  }

  iterateStChanges(total_ch, etr, zdsv)
  produceEffects(total_ch, etr);

  //utils_simple.wipeObj(original_states);
  //all_i_cg.length = all_ch_compxs.length = changed_states.length = 0;

  if (etr.sendStatesToMPX != null && total_ch.length){
    etr.sendStatesToMPX(total_ch);
  }

  total_ch.length = 0;

  utils_simple.wipeObj(zdsv.total_original_states)


  serv_st.collecting_states_changing = false;
  etr.serv_st = null

  release(pool, serv_st);
  //zdsv = null;
  return etr;
}

// mirco optimisations for monomorphism of args
function createIterate0arg(cb) {
  return function iterageChListWith0Args(changes_list, context) {
    for (var i = 0; i < changes_list.length; i+=CH_GR_LE) {
      cb(context, i, changes_list[i], changes_list[i+1]);
    }
  }
}

function createIterate1arg(cb) {
  return function iterageChListWith1Args(changes_list, context, arg1) {
    for (var i = 0; i < changes_list.length; i+=CH_GR_LE) {
      cb(context, i, changes_list[i], changes_list[i+1], arg1);
    }
  }
}

function _setUndetailedState(etr, i, state_name, value) {
  etr._lbr.undetailed_states[state_name] = value;
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

function proxyStch(target, value, state_name) {
  var old_value = target.zdsv.stch_states[state_name];
  if (old_value === value) {
    return;
  }

  target.zdsv.stch_states[state_name] = value;
  var method = getStateChangeEffect(target, state_name)

  method(target, value, old_value);
}

function _handleStch(etr, state_name, value) {
  var method = getStateChangeEffect(etr, state_name);
  if (method == null) {
    return;
  }

  etr.zdsv.abortFlowSteps('stch', state_name, true);

  var old_value = etr.zdsv.stch_states[state_name];
  if (old_value === value) {
    return;
  }

  var flow_step = etr.nextLocalTick(proxyStch, [etr, value, state_name], true, method.finup);
  flow_step.p_space = 'stch';
  flow_step.p_index_key = state_name;
  etr.zdsv.createFlowStepsArray('stch', state_name, flow_step);
}

function getChanges(etr, total_original_states, original_states, start_from, changes_list, result_arr) {
  var changed_states = result_arr;
  var i;

  // input array can be same as output array
  // we are going mutate output array
  // so we will mutate length of input during processing!
  // preventing infinit circle here
  var inputLength = changes_list.length
  for (i = start_from; i < inputLength; i+=CH_GR_LE) {
    var state_name = changes_list[i]
    reportBadChange(etr, state_name)
    _replaceState(etr, total_original_states, original_states, sameName(state_name), changes_list[i+1], changed_states);
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

function _replaceState(etr, total_original_states, original_states, state_name, value, stack) {
  var old_value = etr.states[state_name];
  if (old_value === value){
    return;
  }

  if (shallowEqual(old_value, value)) {
    return
  }

  //value = value || false;
  //less calculations? (since false and "" and null and undefined now os equeal and do not triggering changes)
  if (!total_original_states.hasOwnProperty(state_name)) {
    total_original_states[state_name] = old_value;
  }

  if (!original_states.hasOwnProperty(state_name)) {
    original_states[state_name] = old_value;
  }
  etr._attrs_collector.ensureAttr(state_name)
  etr.states[state_name] = value;
  stack.push(state_name, value);
}

function getComplexInitList(etr) {
  if (etr.full_comlxs_list == null) {return;}
  var result_array = [];

  for (var i = 0; i < etr.full_comlxs_list.length; i++) {
    var cur = etr.full_comlxs_list[i];
    result_array.push(cur.name, compoundComplexState(etr, cur));
  }

  return result_array;
}

function applyComplexStates(etr, total_original_states, original_states, start_from, input_and_output) {
  // reuse set
  var uniq = getFreeSet()

  var i, cur;

  var originalLength = input_and_output.length

  for ( i = start_from; i < originalLength; i+=CH_GR_LE) {
    cur = etr.full_comlxs_index[input_and_output[i]];
    if (cur == null){
      continue;
    }
    for (var jj = 0; jj < cur.length; jj++) {
      var subj = cur[jj]
      var name = subj.name;
      if (uniq.has(name)) {
        continue;
      }

      uniq.add(name)

      var value = compoundComplexState(etr, subj)
      _replaceState(
        etr, total_original_states, original_states,

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
  var values = new Array(temp_comx.depends_on.length);
  for (var i = 0; i < temp_comx.depends_on.length; i++) {
    values[i] = etr.state(temp_comx.depends_on[i]);
  }
  return temp_comx.fn.apply(etr, values);
}

function compressChangesList(result_changes, changes_list, i, prop_name, value, counter) {
  if (result_changes.has(prop_name)){
    return;
  }

  result_changes.add(prop_name);

  var num = (changes_list.length - 1) - counter * CH_GR_LE;
  changes_list[ num - 1 ] = prop_name;
  changes_list[ num ] = value;

  return true;
}

function createReverseIterate0arg(cb) {
  return function reverseIterateChListWith0Args(changes_list, context) {
    var counter = 0;
    for (var i = changes_list.length - 1; i >= 0; i-=CH_GR_LE) {
      if (cb(context, changes_list, i, changes_list[i-1], changes_list[i], counter)){
        counter++;
      }
    }
    return counter;
  }
}


function compressStatesChanges(changes_list) {
  var result_changes = getFreeSet();
  var counter = reversedCompressChanges(changes_list, result_changes);
  counter = counter * CH_GR_LE;
  while (changes_list.length != counter){
    changes_list.shift();
  }
  releaseSet(result_changes)
  return changes_list;
}

function legacySideEffects(etr, changes_list, start_from, inputLength) {
  if (etr.__syncStatesChanges != null || etr.__handleHookedSync != null) {
    var to_send = changes_list.slice(start_from, inputLength)
    if (etr.__syncStatesChanges != null) {
      etr.__syncStatesChanges.call(null, etr, to_send, etr.states);
    }

    if (etr.__handleHookedSync != null) {
      etr.__handleHookedSync.call(null, etr, to_send, etr.states);
    }
  }

  for (var i = start_from; i < inputLength; i+=CH_GR_LE) {
    _handleStch(etr, changes_list[i], changes_list[i+1]);
  }
}


function _triggerStChanges(etr, i, state_name, value, zdsv) {

  _passHandleState(etr, zdsv.total_original_states, state_name, value);

  checkStates(etr, zdsv, state_name, value, zdsv.total_original_states[state_name]);
  deliverAttrQueryUpdates(etr, state_name)
  // states_links

  triggerLightAttrChange(etr, state_name, value, zdsv)
}

function reportBadChange(etr, state_name) {
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
  if (md.hasComplexStateFn(state_name)){
    throw new Error("you can't change complex state " + state_name);
  }
  return updateProxy(md, [state_name, state_value], opts);


  // md.updateState(state_name, state_value, opts);
};
updateProxy.getComplexInitList = getComplexInitList;

return updateProxy;
});
