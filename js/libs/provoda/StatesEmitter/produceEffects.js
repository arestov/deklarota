define(function (require) {
'use strict';
var pvState = require('../utils/state');
var spv =  require('spv')
var countKeys = spv.countKeys
var CH_GR_LE = 2

function checkAndMutateCondReadyEffects(changes_list, self) {
  var index = self.__api_effects_$_index;

  for (var i = 0; i < changes_list.length; i+=CH_GR_LE) {
    var state_name = changes_list[i];
    if (!index[state_name]) {continue;}

    var value = changes_list[i+1];

    var old_ready = self._effects_using.conditions_ready[index[state_name].name];
    self._effects_using.conditions_ready[index[state_name].name] = Boolean(value);
    if (Boolean(old_ready) === Boolean(value)) {
      continue;
    }
  }
}

function getCurrentTransactionId(self) {
  var current_motivator = self._currentMotivator()
  var id = current_motivator && current_motivator.complex_order[0]
  if (id) {
    return id
  }
}

function getCurrentTransactionKey(self) {
  var id = getCurrentTransactionId(self)
  if (id) {
    return id
  }
  console.warn('no id for transaction. using shared')
  return 'temp'
}

function agendaKey(self, initial_transaction_id) {
  return initial_transaction_id + '-' + self.getInstanceKey()
}

function ensureEffectStore(self, effect_name, initial_transaction_id) {
  if (!self._highway.__produce_side_effects_schedule) {
    self._highway.__produce_side_effects_schedule = new Map()
  }

  var key = agendaKey(self, initial_transaction_id)
  if (!self._highway.__produce_side_effects_schedule.get(key)) {
    self._highway.__produce_side_effects_schedule.set(key, {})
  }

  if (!self._highway.__produce_side_effects_schedule.get(key)[effect_name]) {
    self._highway.__produce_side_effects_schedule.get(key)[effect_name] = {
      prev_values: {},
      next_values: {},
    }
  }

  return self._highway.__produce_side_effects_schedule.get(key)[effect_name]
}

function scheduleEffect(self, effect_name, state_name, new_value, skip_prev) {
  var initial_transaction_id = getCurrentTransactionKey(self)
  var effectAgenda = ensureEffectStore(self, effect_name, initial_transaction_id)
  if (!skip_prev && !effectAgenda.prev_values.hasOwnProperty(state_name)) {
    effectAgenda.prev_values[state_name] = self.zdsv.total_original_states[state_name]
  }

  effectAgenda.next_values[state_name] = new_value
}

function checkAndMutateInvalidatedEffects(changes_list, self) {
  var index = self.__api_effects_$_index_by_triggering;
  var using = self._effects_using;

  for (var i = 0; i < changes_list.length; i+=CH_GR_LE) {
    var state_name = changes_list[i];
    if (!index[state_name]) {
      continue;
    }
    var list = index[state_name];
    for (var jj = 0; jj < list.length; jj++) {
      var effect_name = list[jj].name
      if (!using.conditions_ready[effect_name]) {
        continue;
      }

      // mark state
      scheduleEffect(self, list[jj].name, state_name, changes_list[i+1], false)
      self._effects_using.invalidated[list[jj].name] = true;
    }
    // self.__api_effects_$_index_by_triggering[index[state_name].name] = true;
    // self._effects_using.invalidated[index[state_name].name] = true;
  }
}

function prefillAgenda(self, effect_name, effect) {
  for (var i = 0; i < effect.triggering_states.length; i++) {
    var state_name = effect.triggering_states[i]
    scheduleEffect(self, effect_name, state_name, pvState(self, state_name), true)

  }
}

function checkAndMutateDepReadyEffects(self) {
  var using = self._effects_using;
  var effects = self.__api_effects;

  // маркировать готовые
  /*
    у которых не готовы зависимости - те не готовы
    выполнять готовых
    повторить проверку
    повторить выполнение
    повторять до упора

  */
  using.dep_effects_ready_is_empty = true;

  var has_one = false;

  for (var effect_name in using.invalidated) {
    if (!using.invalidated[effect_name]) {
      continue;
    }

    var effect = effects[effect_name];

    var deps_ready = true;

    if (effect.deps && !using.conditions_ready[effect_name]) {
      deps_ready = false;
    }

    if (!deps_ready) {
      using.dep_effects_ready[effect_name] = false;
      continue;
    }

    for (var cc = 0; cc < effect.apis.length; cc++) {
      var api = effect.apis[cc];

      if (!self._interfaces_using || !self._interfaces_using.used[api]) {
        deps_ready = false;
        break;
      }
    }

    if (!deps_ready) {
      using.dep_effects_ready[effect_name] = false;
      continue;
    }

    if (!effect.effects_deps) {
      using.dep_effects_ready[effect_name] = true;
      prefillAgenda(self, effect_name, effect)
      has_one = true;
      continue;
    }

    has_one = true;
    for (var i = 0; i < effect.effects_deps.length; i++) {
      var dep_effect_name = effect.effects_deps[i];
      if (using.invalidated[dep_effect_name] || !using.once[dep_effect_name]) {
          deps_ready = false;
          has_one = false;
          break;
      }
    }


    using.dep_effects_ready[effect_name] = deps_ready;
    if (using.dep_effects_ready[effect_name]) {
      prefillAgenda(self, effect_name, effect)
    }
  }
  using.dep_effects_ready_is_empty = using.dep_effects_ready_is_empty && !has_one;
}

function handleEffectResult(self, effect, result) {
  var handle = effect.result_handler;
  if (!effect.is_async) {
    if (!handle) {return;}
    handle(self, result);
    return;
  }

  self.addRequest(result);

  if (!handle) {return;}
  result.then(function (result) {
    handle(self, result);
  });

}

function getValue(self, agenda, state_name) {
  if (agenda.next_values.hasOwnProperty(state_name)) {
    return agenda.next_values[state_name]
  }

  return pvState(self, state_name)
}

function executeEffect(self, effect_name, transaction_id) {
  var key = agendaKey(self, transaction_id)
  var trans_store = self._highway.__produce_side_effects_schedule.get(key)

  var agenda = trans_store && trans_store[effect_name]
  if (!agenda) {
    return
  }



  var effect = self.__api_effects[effect_name];

  var args = new Array(effect.apis.length + effect.triggering_states.length);
  for (var i = 0; i < effect.apis.length; i++) {
    var api = self._interfaces_using.used[effect.apis[i]];
    if (!api) {
      // do not call effect fn
      delete trans_store[effect_name]
      if (!countKeys(trans_store)) {
        self._highway.__produce_side_effects_schedule.delete(key)
      }
      return
    }
    args[i] = api
  }
  for (var jj = 0; jj < effect.triggering_states.length; jj++) {
    args[effect.apis.length + jj] = getValue(self, agenda, effect.triggering_states[jj])
  }

  var result = effect.fn.apply(null, args);
  handleEffectResult(self, effect, result);

  delete trans_store[effect_name]
  if (!countKeys(trans_store)) {
    self._highway.__produce_side_effects_schedule.delete(key)
  }

}

function checkExecuteMutateEffects(self) {
  var using = self._effects_using;

  for (var effect_name in using.dep_effects_ready) {
    if (!using.dep_effects_ready[effect_name]) {
      continue;
    }

    // we can push anytimes we want
    // 1st handler will erase agenda, so effects will be called just 1 time

    var initial_transaction_id = getCurrentTransactionKey(self)
    var effectAgenda = ensureEffectStore(self, effect_name, initial_transaction_id)
    effectAgenda.schedule_confirmed = true

    using.invalidated[effect_name] = false;
    using.dep_effects_ready[effect_name] = false;
    using.once[effect_name] = true;
  }

  using.dep_effects_ready_is_empty = true;
}

function iterateEffects(changes_list, self) {
  if (!self.__api_effects_$_index) {
    return;
  }

  if (!self._effects_using) {
    self._effects_using = {
      processing: false,
      conditions_ready: {},
      invalidated: {},
      once: {},
      dep_effects_ready: {},
      dep_effects_ready_is_empty: true
    };
  }

  if (self._effects_using.processing) {
    return;
  }
  self._effects_using.processing = true;

  checkAndMutateCondReadyEffects(changes_list, self);
  checkAndMutateInvalidatedEffects(changes_list, self);

  checkAndMutateDepReadyEffects(self);

  while (!self._effects_using.dep_effects_ready_is_empty) {
    checkExecuteMutateEffects(self);
    checkAndMutateDepReadyEffects(self);
  }
  self._effects_using.processing = false;
}

function checkApi(declr, value, self) {
  if (!value) {
    self.useInterface(declr.name, null, declr.destroy);
    return;
  }

  if (!declr.needed_apis) {
    self.useInterface(declr.name, declr.fn());
    return
  }

  var args = new Array(declr.needed_apis.length);
  for (var i = 0; i < declr.needed_apis.length; i++) {
    args[i] = self._interfaces_using.used[declr.needed_apis[i]];
  }

  self.useInterface(declr.name, declr.fn.apply(null, args));

}

function iterateApis(changes_list, context) {
  //index by uniq
  var index = context.__apis_$_index;
  if (!index) {
    return;
  }

  for (var i = 0; i < changes_list.length; i+=CH_GR_LE) {
    var state_name = changes_list[i];
    if (!index[state_name]) {
      continue;
    }

    checkApi(index[state_name], changes_list[i+1], context);
  }
}


return function (total_ch, self) {
  iterateApis(total_ch, self);
  iterateEffects(total_ch, self);
  scheduleTransactionEnd(self)
};

function scheduleTransactionEnd(self) {
  if (self._highway.__produce_side_effects_schedule == null) {
    return
  }

  var calls_flow = self._getCallsFlow()

  var tid = getCurrentTransactionId(self)
  var key = agendaKey(self, getCurrentTransactionKey(self))

  if (!self._highway.__produce_side_effects_schedule.has(key)) {
    return
  }

  calls_flow.scheduleTransactionEnd(
    tid ? tid : Infinity,
    null,
    [self, key],
    handleTransactionEnd
  )
}

function handleTransactionEnd(self, key) {
  if (!self._highway.__produce_side_effects_schedule.has(key)) {
    return
  }

  var flow = self._getCallsFlow()
  var tkey = getCurrentTransactionKey(self)

  var effects_schedule = self._highway.__produce_side_effects_schedule.get(key)
  for (var effect_name in effects_schedule) {
    if (!effects_schedule.hasOwnProperty(effect_name)) {
      continue
    }
    var cur = effects_schedule[effect_name]
    if (!cur.schedule_confirmed) {
      continue
    }

    flow.pushToFlow(
      executeEffect,
      self,
      [self, effect_name, tkey],
      null,
      null,
      null,
      self._currentMotivator()
    );

  }

  flow.pushToFlow(
    eraseTransactionEffectsData,
    null,
    [self, key],
    null,
    null,
    null,
    self._currentMotivator()
  );


}

function eraseTransactionEffectsData(self, key) {
  self._highway.__produce_side_effects_schedule.delete(key)
}

});
