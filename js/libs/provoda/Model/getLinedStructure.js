
import spv from '../../spv'
import isGlueRel from '../dcl/glue_rels/isGlueRel'

var checkModel = function(original_models, md_or_mdreplacer, models_index, local_index, all_for_parse) {
  if (md_or_mdreplacer == null) {return}
  var cur_id = md_or_mdreplacer._provoda_id
  if (cur_id == null) {return}

  var md = original_models[cur_id]

  if (!models_index[cur_id] && !local_index[cur_id]) {
    local_index[cur_id] = true
    all_for_parse.push(md)
  }
  return cur_id
}

var getLinedStructure = function(models_index_raw, local_index_raw) {
  //используется для получения массива всех РЕАЛЬНЫХ моделей, связанных с текущей
  var local_index = local_index_raw || {}
  var models_index = models_index_raw || {}
  var big_result_array = []
  var all_for_parse = [this]

  var original_models = this._highway.models


  while (all_for_parse.length) {
    var cur_md = all_for_parse.shift()
    var can_push = !models_index[cur_md._provoda_id]
    if (can_push) {
      models_index[cur_md._provoda_id] = true
    }
    checkModel(original_models, cur_md.map_parent, models_index, local_index, all_for_parse)

    for (var nesting_name in cur_md.children_models) {
      if (isGlueRel(cur_md, nesting_name)) {
        continue
      }
      var cur = cur_md.children_models[nesting_name]
      if (cur == null) {
        continue
      }

      if (cur._provoda_id) {
        checkModel(original_models, cur, models_index, local_index, all_for_parse)
        continue
      }

      var array
      if (Array.isArray(cur)) {
        array = cur
      } else {
        array = spv.getTargetField(cur, 'residents_struc.all_items')
        if (!array) {
          throw new Error('you must provide parsable array in "residents_struc.all_items" prop')
        }
      }

      for (var i = 0; i < array.length; i++) {
        checkModel(original_models, array[i], models_index, local_index, all_for_parse)
      }

    }


    if (can_push) {
      big_result_array.push(cur_md)
    }
  }

  return big_result_array

}

export default getLinedStructure
