import ensurePublicAttrs from './ensurePublicAttrs'
import isPublicRel from './rel/isPublicRel'

const checkModel = function(md, models_index, local_index, all_for_parse) {
  const cur_id = md._node_id
  if (!models_index[cur_id] && !local_index[cur_id]) {
    local_index[cur_id] = true
    all_for_parse.push(md)
  }
  return cur_id
}

const handleNesting = function(cur, models_index, local_index, all_for_parse) {
  if (!cur) {
    return cur
  }

  if (!Array.isArray(cur)) {
    if (!cur._node_id) {
      throw new Error('unknown data structure inside nesting')
    }

    return checkModel(cur, models_index, local_index, all_for_parse)
  }

  const array = new Array(cur.length)
  for (let i = 0; i < cur.length; i++) {
    array[i] = checkModel(cur[i], models_index, local_index, all_for_parse)
  }
  return array
}


const iterate = function(models_index, all_for_parse, local_index, big_result) {


  while (all_for_parse.length) {
    const cur_md = all_for_parse.shift()
    const can_push = !models_index[cur_md._node_id]
    if (!can_push) {
      continue
    }

    models_index[cur_md._node_id] = true

    const public_attrs = ensurePublicAttrs(cur_md)

    const result = {
      _node_id: cur_md._node_id,
      model_name: cur_md.model_name,
      hierarchy_num: cur_md.hierarchy_num,
      constr_id: cur_md.constr_id,
      states: public_attrs,
      map_parent: cur_md.map_parent && checkModel(cur_md.map_parent, models_index, local_index, all_for_parse),
      children_models: {},
      mpx: null
    }

    for (const nesting_name in cur_md.children_models) {
      const cur = cur_md.children_models[nesting_name]
      if (!isPublicRel(cur_md, nesting_name)) {
        continue
      }

      result.children_models[nesting_name] = handleNesting(cur, models_index, local_index, all_for_parse)
    }
    if (can_push) {
      big_result.push(result)
    }

  }


  return big_result
}

const toSimpleStructure = function(models_index, big_result) {
  //используется для получения массива всех ПОДДЕЛЬНЫХ, пригодных для отправки через postMessage моделей, связанных с текущей
  models_index = models_index || {}
  const all_for_parse = [this]
  const local_index = {}

  big_result = big_result || []

  return iterate(models_index, all_for_parse, local_index, big_result)
}

const parseNesting = function(models_index, cur, big_result) {
  const all_for_parse = []
  const local_index = {}

  handleNesting(cur, models_index, local_index, all_for_parse)

  return iterate(models_index, all_for_parse, local_index, big_result)
}

toSimpleStructure.parseNesting = parseNesting

export default toSimpleStructure
