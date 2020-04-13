define(function(require) {
'use strict';
var spv = require('spv')
var cloneObj = spv.cloneObj
var isPrivate = require('./isPrivateState')
var replaceModelInState = require('./replaceModelInState')

var checkModel = function(md, models_index, local_index, all_for_parse) {
  var cur_id = md._provoda_id;
  if (!models_index[cur_id] && !local_index[cur_id]){
    local_index[cur_id] = true;
    all_for_parse.push(md);
  }
  return cur_id;
};

var handleNesting = function(cur, models_index, local_index, all_for_parse) {
  if (!cur) {
    return cur;
  }

  if (!Array.isArray(cur)) {
    if (cur.each_items) {
      for (var i = 0; i < cur.each_items.length; i++) {
        checkModel(cur.each_items[i], models_index, local_index, all_for_parse);
      }

      var copy = cloneObj({
        $not_model: true,
      }, cur)
      delete copy.each_items

      return copy;
    }

    if (!cur._provoda_id) {
      throw new Error('unknown data structure inside nesting')
    }

    return checkModel(cur, models_index, local_index, all_for_parse);
  }

  var array = new Array(cur.length);
  for (var i = 0; i < cur.length; i++) {
    array[i] = checkModel(cur[i], models_index, local_index, all_for_parse);
  }
  return array
}

var ensurePublicAttrs = function(cur_md) {
  if (cur_md._prepared_public_attrs_snapshot) {
    return cur_md._prepared_public_attrs_snapshot
  }

  var result = cloneObj({}, cur_md.states)

  for (var state_name in result){
    var state = result[state_name];
    if (isPrivate(state_name)) {
      delete result[state_name];
      continue;
    }
    result[state_name] = replaceModelInState(state)
  }


  cur_md._prepared_public_attrs_snapshot = result
  return result
}

var iterate = function( models_index, all_for_parse, local_index, big_result) {


  while (all_for_parse.length) {
    var cur_md = all_for_parse.shift();
    var can_push = !models_index[cur_md._provoda_id];
    if (!can_push) {
      continue;
    }

    models_index[cur_md._provoda_id] = true;

    var public_attrs = ensurePublicAttrs(cur_md)

    var result = {
      _provoda_id: cur_md._provoda_id,
      model_name: cur_md.model_name,
      states: public_attrs,
      map_parent: cur_md.map_parent && checkModel(cur_md.map_parent, models_index, local_index, all_for_parse),
      children_models: {},
      map_level_num: cur_md.map_level_num,
      mpx: null
    };

    for (var nesting_name in cur_md.children_models){
      var cur = cur_md.children_models[nesting_name];
      result.children_models[nesting_name] = handleNesting(cur, models_index, local_index, all_for_parse)
    }
    if (can_push) {
      big_result.push(result);
    }

  }


  return big_result;
}

var toSimpleStructure = function(models_index, big_result) {
  //используется для получения массива всех ПОДДЕЛЬНЫХ, пригодных для отправки через postMessage моделей, связанных с текущей
  models_index = models_index || {};
  var all_for_parse = [this];
  var local_index = {};

  big_result = big_result || [];

  return iterate(models_index, all_for_parse, local_index, big_result)
};

var parseNesting = function(models_index, cur, big_result) {
  var all_for_parse = []
  var local_index = {};

  handleNesting(cur, models_index, local_index, all_for_parse)

  return iterate(models_index, all_for_parse, local_index, big_result)
}

toSimpleStructure.parseNesting = parseNesting

return toSimpleStructure
})
