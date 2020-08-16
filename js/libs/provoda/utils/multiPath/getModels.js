// - написать функцию которая получает модели из multiPath
// - написать функцию которая аггрегирует значения из моделей multiPath
// - написать функцию, котоая записывает state/nesting в модели multiPath


import getNesting from 'pv/getNesting'

import getStart from './getStart'

// {
//   result_type: result_type,
//   state: {
//     base: string.split('.')[0],
//     path: string,
//   },
//   nesting: {
//     path: path,
//     zip_name: parts[0] || null,
//   },
//   resource: {
//     path: string,
//   },
//   from_base: {
//     type: 'parent',
//     steps: from_parent_num[0].length,
//   },
// }

var getModels = function(md, multi_path, data, all_nestings) {
  var start_md = getStart(md, multi_path, false, data)

  return getDeepNesting(
    start_md,
    multi_path,
    all_nestings
  )
  // var base;
  // var resource;
  // var nesting;

}

function addExisting(result, from, nest_name) {
  var subject = from && getNesting(from, nest_name)
  if (!subject) {
    return
  }
  if (!Array.isArray(subject)) {
    result.push(subject)
    return
  }

  Array.prototype.push.apply(result, subject)
}

function add(result, list, nest_name) {
  if (!list) {
    return
  }

  if (!Array.isArray(list)) {
    addExisting(result, list, nest_name)
    return
  }

  for (var i = 0; i < list.length; i++) {
    addExisting(result, list[i], nest_name)
  }
}

function getDeepNesting(md, multi_path, all_nestings) {
  /*
  {
    path: path,
    zip_name: parts[0] || null,
  }
  */
  var info = multi_path.nesting
  var just_base = !all_nestings && multi_path.result_type === 'nesting'

  if (!info || !info.path) {
    return md
  }

  var exec_path = just_base ? info.base : info.path

  var cur = [md]
  for (var i = 0; i < exec_path.length; i++) {
    var nested = []
    var nest_name = exec_path[i]
    add(nested, cur, nest_name)
    cur = nested
  }

  return cur
}

export default getModels