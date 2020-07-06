define(function(require) {
'use strict';
var spv = require('spv')

var isPrivate = require('./isPrivateState')

var checkModel = function(md, models_index, local_index, all_for_parse) {
  if (!md) {
    return;
  }
  var cur_id = md._provoda_id;
  if (typeof cur_id == 'undefined') {
    return;
  }
  if (!models_index[cur_id] && !local_index[cur_id]){
    local_index[cur_id] = true;
    all_for_parse.push(md);
  }
  return cur_id;
};

var getLinedStructure = function(models_index_raw, local_index_raw) {
  //используется для получения массива всех РЕАЛЬНЫХ моделей, связанных с текущей
  var local_index = local_index_raw || {};
  var models_index = models_index_raw || {};
  var big_result_array = [];
  var all_for_parse = [this];





  while (all_for_parse.length) {
    var cur_md = all_for_parse.shift();
    var can_push = !models_index[cur_md._provoda_id];
    if (can_push) {
      models_index[cur_md._provoda_id] = true;
    }
    checkModel(cur_md.map_parent, models_index, local_index, all_for_parse);


    for (var state_name in cur_md.states){
      if (isPrivate(state_name)) {
        continue
      }
      checkModel(cur_md.states[state_name], models_index, local_index, all_for_parse);

    }

    for (var nesting_name in cur_md.children_models){
      var cur = cur_md.children_models[nesting_name];
      if (cur){
        if (cur._provoda_id){
          checkModel(cur, models_index, local_index, all_for_parse);
        } else {
          var array;
          if (Array.isArray(cur)){
            array = cur;
          } else {
            array = spv.getTargetField(cur, 'residents_struc.all_items');
            if (!array) {
              throw new Error('you must provide parsable array in "residents_struc.all_items" prop');
            }
          }
          for (var i = 0; i < array.length; i++) {
            checkModel(array[i], models_index, local_index, all_for_parse);
          }
        }
      }
    }


    if (can_push) {
      big_result_array.push(cur_md);
    }
  }

  return big_result_array;

};

return getLinedStructure
})
