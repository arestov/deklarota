define(function(require) {
'use strict';
var cloneObj = require('spv').cloneObj

var checkModel = function(md, models_index, local_index, all_for_parse) {
  var cur_id = md._provoda_id;
  if (!models_index[cur_id] && !local_index[cur_id]){
    local_index[cur_id] = true;
    all_for_parse.push(md);
  }
  return cur_id;
};

var toSimpleStructure = function(models_index, big_result) {
  //используется для получения массива всех ПОДДЕЛЬНЫХ, пригодных для отправки через postMessage моделей, связанных с текущей
  models_index = models_index || {};
  var local_index = {};
  var all_for_parse = [this];
  big_result = big_result || [];



  while (all_for_parse.length) {
    var cur_md = all_for_parse.shift();
    var can_push = !models_index[cur_md._provoda_id];
    if (can_push) {
      models_index[cur_md._provoda_id] = true;
    }

    var result = {
      _provoda_id: cur_md._provoda_id,
      model_name: cur_md.model_name,
      states: cloneObj({}, cur_md.states),
      map_parent: cur_md.map_parent && checkModel(cur_md.map_parent, models_index, local_index, all_for_parse),
      children_models: {},
      map_level_num: cur_md.map_level_num,
      mpx: null
    };
    for (var state_name in result.states){
      var state = result.states[state_name];
      if (state && state._provoda_id){
        result.states[state_name] = {
          _provoda_id: checkModel(state, models_index, local_index, all_for_parse)
        };
      }
    }

    for (var nesting_name in cur_md.children_models){
      var cur = cur_md.children_models[nesting_name];
      if (cur){
        if (cur._provoda_id){
          result.children_models[nesting_name] = checkModel(cur, models_index, local_index, all_for_parse);
        } else {

          var array = new Array(cur.length);
          for (var i = 0; i < cur.length; i++) {
            array[i] = checkModel(cur[i], models_index, local_index, all_for_parse);
          }
          result.children_models[nesting_name] = array;
        }
      }
    }
    if (can_push) {
      big_result.push(result);
    }

  }


  return big_result;
};

return toSimpleStructure
})
